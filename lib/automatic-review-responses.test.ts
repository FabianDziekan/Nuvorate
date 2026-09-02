import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function source(path: string) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

const migration = source("docs/database/029_automatic_review_response_jobs.sql");
const publicationFoundationMigration = source("docs/database/032_automatic_google_publication_foundation.sql");
const sync = source("lib/google-review-sync-service.ts");
const worker = source("lib/automatic-review-response-service.ts");
const workerRoute = source("app/api/internal/automatic-review-responses/route.ts");
const singleJobRoute = source("app/api/internal/automatic-review-responses/[jobId]/route.ts");
const settingsUi = source("components/responses/response-settings-card.tsx");

test("only reviews first observed by sync without a durable job can be enqueued", () => {
  assert.match(sync, /ignoreDuplicates: true/);
  assert.match(sync, /INSERT \.\.\. ON CONFLICT DO NOTHING is the authoritative new-record/);
  assert.match(sync, /newReviewIds = \(insertedReviews \?\? \[\]\)\.map/);
  assert.match(sync, /automatic_response_enqueue_pending/);
  assert.match(sync, /enqueueAutomaticReviewResponseJobs\(connection\.business_id, enqueueReviewIds\)/);
  assert.match(migration, /Existing Google reviews are explicitly baselined as already seen/);
  assert.match(migration, /on conflict \(review_id\) do nothing/);
});

test("failed enqueue keeps a durable pending marker without scanning historical reviews", () => {
  assert.match(migration, /automatic_response_enqueue_pending boolean not null default false/);
  assert.match(migration, /reviews_mark_new_google_review_for_automatic_response/);
  assert.match(migration, /update public\.reviews as review[\s\S]*automatic_response_enqueue_pending = false/);
  assert.match(sync, /\.eq\("automatic_response_enqueue_pending", true\)/);
});

test("one durable job per review prevents sync retries and concurrent syncs from duplicating generation", () => {
  assert.match(migration, /review_id uuid not null unique/);
  assert.match(migration, /insert into public\.automatic_review_response_jobs/);
  assert.match(migration, /on conflict \(review_id\) do nothing/);
});

test("workers claim jobs atomically and can safely recover expired leases", () => {
  assert.match(migration, /for update skip locked/);
  assert.match(migration, /job\.status = 'processing' and job\.lease_expires_at <= pg_catalog\.clock_timestamp\(\)/);
  assert.match(migration, /status = 'processing'/);
  assert.match(migration, /attempt_count = job\.attempt_count \+ 1/);
  assert.match(migration, /check \(attempt_count between 0 and 3\)/);
  assert.match(migration, /job\.attempt_count < 3/);
  assert.match(migration, /exhausted\.attempt_count >= 3/);
  assert.match(migration, /last_error = 'attempt_limit_reached'/);
  assert.match(workerRoute, /for \(const job of jobs\)/);
});

test("a specific claim can own only its requested eligible job", () => {
  const specificClaim = source("docs/database/030_claim_specific_automatic_review_response_job.sql");

  assert.match(specificClaim, /where job\.id = p_job_id/);
  assert.match(specificClaim, /for update skip locked/);
  assert.match(specificClaim, /job\.attempt_count < 3/);
  assert.match(specificClaim, /job\.status = 'pending'/);
  assert.match(specificClaim, /job\.status = 'failed'/);
  assert.match(specificClaim, /job\.status = 'processing' and job\.lease_expires_at <= pg_catalog\.clock_timestamp\(\)/);
  assert.match(specificClaim, /attempt_count = job\.attempt_count \+ 1/);
  assert.match(specificClaim, /lease_token = p_lease_token/);
  assert.match(specificClaim, /lease_expires_at = pg_catalog\.clock_timestamp\(\) \+ pg_catalog\.make_interval/);
  assert.match(specificClaim, /security definer/);
  assert.match(specificClaim, /set search_path = ''/);
  assert.match(specificClaim, /grant execute[\s\S]*to service_role/);
  assert.doesNotMatch(specificClaim, /grant execute[\s\S]*to authenticated/);
});

test("the single-job endpoint is secret-protected and cannot fall back to the global queue", () => {
  assert.match(singleJobRoute, /GOOGLE_REVIEW_SYNC_SECRET/);
  assert.match(singleJobRoute, /status: 401/);
  assert.match(singleJobRoute, /UUID_PATTERN/);
  assert.match(singleJobRoute, /claimSpecificAutomaticReviewResponseJob\(jobId\)/);
  assert.match(singleJobRoute, /processAutomaticReviewResponseJob\(job\)/);
  assert.match(singleJobRoute, /claimed: 1/);
  assert.doesNotMatch(singleJobRoute, /claimAutomaticReviewResponseJobs/);
  assert.match(workerRoute, /claimAutomaticReviewResponseJobs\(AUTOMATIC_RESPONSE_BATCH_SIZE\)/);
  assert.doesNotMatch(workerRoute, /claimSpecificAutomaticReviewResponseJob/);
});

test("a stale lease cannot reserve, renew, finish, call OpenAI, or write a draft", () => {
  const reservation = migration.slice(
    migration.indexOf("create or replace function public.reserve_ai_usage_for_automatic_review_job"),
    migration.indexOf("revoke all on function public.enqueue_automatic_review_response_jobs"),
  );
  const completion = migration.slice(
    migration.indexOf("create or replace function public.finish_automatic_review_response_job"),
    migration.indexOf("create or replace function public.renew_automatic_review_response_job_lease"),
  );
  assert.match(reservation, /lease_expires_at > pg_catalog\.clock_timestamp\(\)/);
  assert.match(completion, /lease_expires_at > pg_catalog\.clock_timestamp\(\)/);
  assert.match(migration, /create or replace function public\.renew_automatic_review_response_job_lease/);
  assert.match(worker, /if \(!await renewLease\(job\)\) return "skipped"/);
  assert.match(worker, /Fence ownership immediately before the external side effect/);
  assert.match(worker, /Fence again after the external call/);
});

test("a recovered job with a saved AI draft is completed without a second OpenAI call or charge", () => {
  assert.match(worker, /existingAiResponse\?\.id/);
  assert.match(worker, /completeAutomaticReservationIfNeeded/);
  assert.match(worker, /reservation\.status === "completed"/);
  assert.match(worker, /await finish\(job, "completed"\)/);
  assert.match(worker, /await releaseAiUsageReservation\(job\.ai_usage_reservation_id/);
});

test("the worker rechecks owner replies, drafts, settings, rating and Business entitlement before OpenAI", () => {
  const beforeGeneration = worker.slice(0, worker.indexOf("const reservation ="));
  assert.match(beforeGeneration, /review\.response_status === "responded"/);
  assert.match(beforeGeneration, /Boolean\(responseText\)/);
  assert.match(beforeGeneration, /!settings\?\.auto_generate/);
  assert.match(beforeGeneration, /!ratingEnabled/);
  assert.match(beforeGeneration, /automaticReviewResponses/);
  assert.match(worker, /await finish\(job, "skipped"\)/);
});

test("AI usage is bound idempotently to the job and retries reuse OpenAI's idempotency key", () => {
  assert.match(migration, /automatic_review_response_job_id uuid/);
  assert.match(migration, /unique \(automatic_review_response_job_id\)/);
  assert.match(migration, /reserve_ai_usage_for_automatic_review_job/);
  assert.match(migration, /v_reservation\.status = 'completed'/);
  assert.match(worker, /p_job_id: job\.job_id/);
  assert.match(worker, /idempotencyKey: `automatic-review-response:\$\{job\.job_id\}`/);
});

test("saving settings no longer scans historical reviews or invokes the old auto-generate endpoint", () => {
  assert.doesNotMatch(settingsUi, /fetch\("\/api\/responses\/auto-generate"/);
  assert.match(settingsUi, /setToast\("Zapisano"\)/);
});

test("the system worker is server-to-server protected and exposes safe aggregate counts only", () => {
  assert.match(workerRoute, /process\.env\.GOOGLE_REVIEW_SYNC_SECRET\?\.trim\(\)/);
  assert.match(workerRoute, /status: 401/);
  assert.match(workerRoute, /\{ claimed: jobs\.length, completed, failed, skipped, success: true \}/);
  assert.doesNotMatch(workerRoute, /createClient\(\)/);
});

test("automatic Google publication remains explicitly off for all existing businesses", () => {
  assert.match(publicationFoundationMigration, /auto_publish boolean not null default false/);
  assert.match(publicationFoundationMigration, /add column if not exists auto_publish/);
  assert.match(settingsUi, /Automatycznie publikuj odpowiedzi w Google/);
  assert.match(settingsUi, /autoPublish/);
});

test("generation hands off a completed draft to durable publication state without calling Google", () => {
  assert.match(worker, /auto_generate && settings\?\.auto_publish && ratingEnabled/);
  assert.match(worker, /automaticPublicationEnabled \? "pending" : "not_requested"/);
  assert.match(worker, /await completeAutomaticReservationIfNeeded[\s\S]*await setPublicationState[\s\S]*await finish\(job, "completed"\)/);
  assert.doesNotMatch(worker, /publishGoogleLocationReviewReply/);
  assert.doesNotMatch(worker, /google-reviews/);
  assert.match(publicationFoundationMigration, /publication_status in \('not_requested', 'pending', 'processing', 'completed', 'retryable_failed', 'terminal_failed'\)/);
});

test("publication claim is separately leased and only accepts completed billed drafts", () => {
  assert.match(publicationFoundationMigration, /claim_automatic_review_response_publication_jobs/);
  assert.match(publicationFoundationMigration, /job\.status = 'completed'/);
  assert.match(publicationFoundationMigration, /reservation\.status = 'completed'/);
  assert.match(publicationFoundationMigration, /review\.response_status = 'ready'/);
  assert.match(publicationFoundationMigration, /review\.response_published_at is null/);
  assert.match(publicationFoundationMigration, /for update of job skip locked/);
  assert.match(publicationFoundationMigration, /publication_status = 'processing'/);
  assert.match(publicationFoundationMigration, /publication_attempt_count = job\.publication_attempt_count \+ 1/);
  assert.match(publicationFoundationMigration, /renew_automatic_review_response_publication_lease/);
});

test("publication-only retry cannot reserve AI usage or re-enter OpenAI generation", () => {
  const publicationClaim = publicationFoundationMigration.slice(
    publicationFoundationMigration.indexOf("create or replace function public.claim_automatic_review_response_publication_jobs"),
    publicationFoundationMigration.indexOf("create or replace function public.finish_automatic_review_response_publication"),
  );
  assert.match(publicationClaim, /job\.publication_status = 'retryable_failed'/);
  assert.doesNotMatch(publicationClaim, /reserve_ai_usage_for_automatic_review_job/);
  assert.doesNotMatch(publicationClaim, /ai_replies_used/);
  assert.doesNotMatch(publicationClaim, /OpenAI/);
});

test("publication RPCs are service-role-only and do not create a Google publishing route", () => {
  for (const name of [
    "set_automatic_review_response_publication_state",
    "claim_automatic_review_response_publication_jobs",
    "finish_automatic_review_response_publication",
    "renew_automatic_review_response_publication_lease",
  ]) {
    assert.match(publicationFoundationMigration, new RegExp(`revoke all on function public\\.${name}`));
    assert.match(publicationFoundationMigration, new RegExp(`grant execute on function public\\.${name}`));
  }
  assert.doesNotMatch(publicationFoundationMigration, /mybusiness\.googleapis\.com/);
  assert.doesNotMatch(publicationFoundationMigration, /http_post/);
});
