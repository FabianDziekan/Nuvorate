import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function source(path: string) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

const cancellationMigration = source(
  "docs/database/034_cancel_automatic_google_publication_on_opt_out.sql",
);
const globalClaim = source(
  "docs/database/032_automatic_google_publication_foundation.sql",
);
const specificClaim = source(
  "docs/database/033_claim_specific_automatic_review_response_publication_job.sql",
);
const publicationService = source("lib/automatic-google-publication-service.ts");
const generationService = source("lib/automatic-review-response-service.ts");

test("disabling auto_publish atomically cancels only pending and retryable publication work", () => {
  assert.match(
    cancellationMigration,
    /when \(old\.auto_publish is true and new\.auto_publish is false\)/,
  );
  assert.match(
    cancellationMigration,
    /publication_status = 'cancelled'/,
  );
  assert.match(
    cancellationMigration,
    /job\.publication_status in \('pending', 'retryable_failed'\)/,
  );
  assert.doesNotMatch(cancellationMigration, /job\.publication_status in \([^)]*'completed'/);
  assert.doesNotMatch(cancellationMigration, /job\.publication_status in \([^)]*'terminal_failed'/);
});

test("cancelled is durable, excluded from both claim paths, and does not change draft or AI state", () => {
  assert.match(cancellationMigration, /'cancelled'/);
  assert.doesNotMatch(globalClaim, /publication_status = 'cancelled'/);
  assert.doesNotMatch(specificClaim, /publication_status = 'cancelled'/);
  assert.doesNotMatch(cancellationMigration, /response_text/);
  assert.doesNotMatch(cancellationMigration, /response_generated_at/);
  assert.doesNotMatch(cancellationMigration, /response_published_at/);
  assert.doesNotMatch(cancellationMigration, /ai_usage/);
  assert.doesNotMatch(cancellationMigration, /ai_review_responses/);
  assert.doesNotMatch(cancellationMigration, /\n\s*status =/);
});

test("a later opt-in cannot reactivate cancelled work, while new generation handoff can request publication", () => {
  assert.doesNotMatch(cancellationMigration, /new\.auto_publish is true/);
  assert.match(
    generationService,
    /automaticPublicationEnabled \? "pending" : "not_requested"/,
  );
});

test("in-flight publication retains the final opt-in check before the only Google write", () => {
  const googleWrite = publicationService.lastIndexOf("publishGoogleLocationReviewReply");
  const beforeGoogleWrite = publicationService.slice(
    0,
    googleWrite,
  );
  assert.match(beforeGoogleWrite, /!settings\.auto_publish/);
  assert.match(publicationService, /if \(!await renewPublicationLease\(job\)\) return "skipped"/);
});

test("the cancellation trigger is isolated, security-definer scoped, and service-role-only", () => {
  assert.match(cancellationMigration, /where job\.business_id = new\.business_id/);
  assert.match(cancellationMigration, /security definer/);
  assert.match(cancellationMigration, /set search_path = ''/);
  assert.match(cancellationMigration, /revoke all on function public\.cancel_pending_automatic_review_response_publications/);
  assert.match(cancellationMigration, /grant execute on function public\.cancel_pending_automatic_review_response_publications\(\)\s*\n\s*to service_role/);
  assert.doesNotMatch(cancellationMigration, /mybusiness\.googleapis\.com/);
  assert.doesNotMatch(cancellationMigration, /http_post/);
});
