import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const schedulerRoute = readFileSync(
  new URL("../app/api/internal/google-review-sync/route.ts", import.meta.url),
  "utf8",
);
const migration = readFileSync(
  new URL("../docs/database/028_google_review_sync_scheduler.sql", import.meta.url),
  "utf8",
);
const manualRoute = readFileSync(new URL("../app/api/google/sync-reviews/route.ts", import.meta.url), "utf8");
const service = readFileSync(new URL("./google-review-sync-service.ts", import.meta.url), "utf8");

test("system sync endpoint accepts only a matching server-to-server secret", () => {
  assert.match(schedulerRoute, /process\.env\.GOOGLE_REVIEW_SYNC_SECRET\?\.trim\(\)/);
  assert.match(schedulerRoute, /request\.headers\.get\("authorization"\) === `Bearer \$\{secret\}`/);
  assert.match(schedulerRoute, /status: 401/);
  assert.match(schedulerRoute, /export async function POST/);
  assert.doesNotMatch(schedulerRoute, /createClient\(\)/);
  assert.doesNotMatch(schedulerRoute, /businessId/);
});

test("automatic sync claims only connected connections and keeps failures isolated", () => {
  assert.match(migration, /where connection\.status = 'connected'/);
  assert.match(schedulerRoute, /for \(const connection of connections\)/);
  assert.match(schedulerRoute, /catch \(error\) \{[\s\S]*?failed \+= 1/);
  assert.match(schedulerRoute, /claimed: connections\.length/);
  assert.match(schedulerRoute, /failed,/);
  assert.match(schedulerRoute, /synced,/);
});

test("lease claim prevents concurrent ownership and lets expired work be claimed again", () => {
  assert.match(migration, /for update skip locked/);
  assert.match(migration, /connection\.sync_lease_expires_at <= pg_catalog\.clock_timestamp\(\)/);
  assert.match(migration, /sync_lease_token = p_lease_token/);
  assert.match(migration, /and connection\.sync_lease_token = p_lease_token/);
});

test("a stale lease token cannot finish or fail a newer synchronization lease", () => {
  const completion = migration.slice(
    migration.indexOf("create or replace function public.complete_google_review_sync_connection"),
    migration.indexOf("-- Transient failures"),
  );
  const failure = migration.slice(
    migration.indexOf("create or replace function public.fail_google_review_sync_connection"),
    migration.indexOf("revoke all on function public.claim_google_review_sync_connections"),
  );
  const renewal = migration.slice(
    migration.indexOf("create or replace function public.renew_google_review_sync_connection"),
    migration.indexOf("-- Transient failures"),
  );

  assert.match(completion, /and connection\.sync_lease_token = p_lease_token/);
  assert.match(failure, /and connection\.sync_lease_token = p_lease_token/);
  assert.match(renewal, /and connection\.sync_lease_token = p_lease_token/);
  assert.match(renewal, /and connection\.sync_lease_expires_at > pg_catalog\.clock_timestamp\(\)/);
  assert.match(completion, /return coalesce\(v_updated, false\)/);
  assert.match(failure, /return coalesce\(v_updated, false\)/);
});

test("transient and reconnect-required failures have different safe connection states", () => {
  assert.match(service, /Google token refresh failed/);
  assert.match(service, /p_requires_reconnect: failure\.requiresReconnect/);
  assert.match(migration, /status = case when coalesce\(p_requires_reconnect, false\) then 'error' else 'connected' end/);
  assert.match(migration, /last_error = left\(/);
});

test("manual and automatic synchronization call the same server-only service without logging tokens", () => {
  assert.match(manualRoute, /syncClaimedGoogleReviewConnection\(connection\)/);
  assert.match(schedulerRoute, /syncClaimedGoogleReviewConnection\(connection\)/);
  assert.match(service, /import "server-only"/);
  assert.match(service, /await renewGoogleReviewSyncLease\(connection\)/);
  assert.doesNotMatch(service, /console\./);
  assert.doesNotMatch(schedulerRoute, /encrypted_refresh_token/);
});

test("scheduler migration exposes system RPCs only to service_role and never creates a cron job", () => {
  assert.match(migration, /revoke all on function public\.claim_google_review_sync_connections[\s\S]*?from public, anon, authenticated/);
  assert.match(migration, /grant execute on function public\.claim_google_review_sync_connections[\s\S]*?to service_role/);
  assert.match(migration, /security definer/);
  assert.match(migration, /set search_path = ''/);
  assert.doesNotMatch(migration, /cron\.schedule\(/);
  assert.doesNotMatch(migration, /net\.http_post\(/);
});
