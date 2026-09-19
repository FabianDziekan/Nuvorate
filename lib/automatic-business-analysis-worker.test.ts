import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

function source(path: string) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

const migration = source("docs/database/037_automatic_business_analysis_worker.sql");
const scheduler = source("docs/database/038_automatic_business_analysis_scheduler.sql");
const worker = source("lib/automatic-business-analysis-worker.ts");
const route = source("app/api/cron/automatic-analysis/route.ts");
const analysisService = source("lib/business-analysis-service.ts");

test("due 14- and 30-day schedules are claimed exactly once with a durable lease", () => {
  assert.match(migration, /frequency_days not in \(7, 14, 30\)/);
  assert.match(migration, /next_run_at <= pg_catalog\.clock_timestamp\(\)/);
  assert.match(migration, /for update skip locked/);
  assert.match(migration, /analysis_lease_token = p_lease_token/);
  assert.match(migration, /analysis_lease_expires_at/);
});

test("disabled, future and changed schedules cannot reach automatic generation", () => {
  assert.match(migration, /schedule\.is_enabled = true/);
  assert.match(migration, /schedule\.frequency_days = p_frequency_days/);
  assert.match(migration, /if p_outcome = 'disabled' then[\s\S]*schedule\.frequency_days = p_frequency_days/);
  assert.match(worker, /if \(!\(await renewScheduleLease\(schedule\)\)\)/);
  assert.match(analysisService, /canProceed && !\(await canProceed\(\)\)/);
});

test("expired leases recover while an active lease cannot be claimed twice", () => {
  assert.match(migration, /analysis_lease_expires_at is null[\s\S]*analysis_lease_expires_at <= pg_catalog\.clock_timestamp\(\)/);
  assert.match(migration, /and schedule\.analysis_lease_expires_at > pg_catalog\.clock_timestamp\(\)/);
  assert.match(migration, /analysis_lease_token = p_lease_token/);
});

test("concurrent workers serialize claims with SKIP LOCKED and a lease-token fence", () => {
  assert.match(migration, /for update skip locked/);
  assert.match(migration, /analysis_lease_token = p_lease_token/);
  assert.match(migration, /analysis_lease_expires_at > pg_catalog\.clock_timestamp\(\)/);
  assert.match(migration, /release_automatic_business_analysis_schedule_lease/);
});

test("success, no-review, limit and technical outcomes use bounded scheduling", () => {
  assert.match(migration, /when p_outcome in \('success', 'no_reviews'\)/);
  assert.match(migration, /interval '1 month 5 minutes'/);
  assert.match(migration, /interval '1 hour'/);
  assert.match(migration, /interval '6 hours'/);
  assert.match(migration, /automatic_failure_count between 0 and 2/);
  assert.match(worker, /outcome === "limit"/);
  assert.match(worker, /outcome === "technical"/);
  assert.match(worker, /processClaimedAutomaticAnalysisSchedule/);
  assert.match(worker, /finishSchedule\(schedule, "technical"\)/);
});

test("no-review and limit results defer the next run without consuming a normal retry", () => {
  assert.match(migration, /when p_outcome in \('success', 'no_reviews'\)/);
  assert.match(migration, /when p_outcome = 'limit' then/);
  assert.match(migration, /next_run_at = case/);
  assert.match(worker, /return "no_reviews"/);
  assert.match(worker, /return "limit"/);
});

test("only the internal POST worker can claim schedules and it reports safe counts", () => {
  assert.match(route, /export async function POST/);
  assert.match(route, /process\.env\.AUTOMATIC_ANALYSIS_WORKER_SECRET/);
  assert.doesNotMatch(route, /process\.env\.CRON_SECRET/);
  assert.match(route, /claimed: schedules\.length/);
  assert.match(route, /completed/);
  assert.match(route, /retried/);
  assert.match(route, /failed/);
  assert.match(route, /skipped/);
});

test("Supabase scheduler uses Vault at runtime and replaces Vercel Cron", () => {
  assert.match(scheduler, /pg_cron/);
  assert.match(scheduler, /pg_net/);
  assert.match(scheduler, /supabase_vault/);
  assert.match(scheduler, /automatic_analysis_worker_secret/);
  assert.match(scheduler, /automatic_analysis_worker_target_url/);
  assert.match(scheduler, /\*\/15 \* \* \* \*/);
  assert.match(scheduler, /net\.http_post/);
  assert.match(scheduler, /timeout_milliseconds := 60000/);
  assert.match(scheduler, /cron\.unschedule/);
  assert.equal(existsSync("vercel.json"), false);
});
