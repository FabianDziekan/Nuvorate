import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function source(path: string) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

const service = source("lib/automatic-google-publication-service.ts");
const globalRoute = source("app/api/internal/automatic-review-responses/publish/route.ts");
const singleRoute = source("app/api/internal/automatic-review-responses/[jobId]/publish/route.ts");
const specificClaim = source("docs/database/033_claim_specific_automatic_review_response_publication_job.sql");
const foundation = source("docs/database/032_automatic_google_publication_foundation.sql");
const googleReviews = source("lib/google-reviews.ts");

test("automatic publication shares the established Google reply PUT service and reconciles first", () => {
  assert.match(service, /findGoogleLocationReview/);
  assert.match(service, /publishGoogleLocationReviewReply/);
  assert.ok(service.indexOf("googleReview = await findGoogleLocationReview") < service.indexOf("publication = await publishGoogleLocationReviewReply"));
  assert.match(googleReviews, /export async function findGoogleLocationReview/);
  assert.match(googleReviews, /const result = await fetchGoogleLocationReviews/);
});

test("publication is a separate phase with no OpenAI or AI billing path", () => {
  assert.doesNotMatch(service, /generateReviewResponseText/);
  assert.doesNotMatch(service, /reserve_ai_usage/);
  assert.doesNotMatch(service, /completeAiUsageReservation/);
  assert.doesNotMatch(service, /releaseAiUsageReservation/);
  assert.doesNotMatch(service, /openAIModel/);
});

test("publication rechecks current opt-in, qualification, completed billing, connection and draft before Google PUT", () => {
  assert.match(service, /!settings\.auto_publish/);
  assert.match(service, /!ratingEnabled/);
  assert.match(service, /reservation\?\.status !== "completed"/);
  assert.match(service, /!connectionReady/);
  assert.match(service, /review\.response_status !== "ready"/);
  assert.match(service, /!review\.google_review_id/);
});

test("same Google reply completes without a second PUT, while a different reply is terminally conflicted", () => {
  assert.match(service, /if \(googleReply !== responseText\)/);
  assert.match(service, /"google_reply_conflict"/);
  const reconciliation = service.slice(service.indexOf("if (googleReply)"), service.indexOf("// Fence immediately"));
  assert.doesNotMatch(reconciliation, /publishGoogleLocationReviewReply/);
  assert.match(reconciliation, /await finishPublication\(job, "completed"\)/);
});

test("lease ownership is fenced before the Google write and publication retries are classified safely", () => {
  assert.match(service, /if \(!await renewPublicationLease\(job\)\) return "skipped"/);
  assert.match(service, /google_publish_retryable_\$\{status\}/);
  assert.match(service, /google_publish_terminal_\$\{status\}/);
  assert.match(service, /"google_reconnect_required"/);
});

test("single publication endpoint is secret-protected and never falls back to the global publication queue", () => {
  assert.match(singleRoute, /GOOGLE_REVIEW_SYNC_SECRET/);
  assert.match(singleRoute, /status: 401/);
  assert.match(singleRoute, /claimSpecificAutomaticGooglePublicationJob\(jobId\)/);
  assert.match(singleRoute, /processAutomaticGooglePublicationJob\(job\)/);
  assert.doesNotMatch(singleRoute, /claimAutomaticGooglePublicationJobs/);
  assert.match(globalRoute, /claimAutomaticGooglePublicationJobs\(AUTOMATIC_PUBLICATION_BATCH_SIZE\)/);
});

test("specific publication claim can claim only one requested eligible job and is service-role-only", () => {
  assert.match(specificClaim, /where job\.id = p_job_id/);
  assert.match(specificClaim, /for update of job skip locked/);
  assert.match(specificClaim, /job\.publication_attempt_count < 3/);
  assert.match(specificClaim, /job\.publication_status = 'pending'/);
  assert.match(specificClaim, /job\.publication_status = 'retryable_failed'/);
  assert.match(specificClaim, /publication_status = 'processing'/);
  assert.match(specificClaim, /publication_attempt_count = job\.publication_attempt_count \+ 1/);
  assert.match(specificClaim, /security definer/);
  assert.match(specificClaim, /set search_path = ''/);
  assert.match(specificClaim, /grant execute[\s\S]*to service_role/);
  assert.doesNotMatch(specificClaim, /grant execute[\s\S]*to authenticated/);
});

test("foundation retries only publication state and preserves one durable job and reservation", () => {
  assert.match(foundation, /publication_status = 'retryable_failed'/);
  assert.match(foundation, /publication_attempt_count < 3/);
  assert.doesNotMatch(specificClaim, /insert into public\.automatic_review_response_jobs/);
  assert.doesNotMatch(specificClaim, /ai_replies_used/);
});
