import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const manualRoute = readFileSync(new URL("../app/api/google/sync-reviews/route.ts", import.meta.url), "utf8");
const migration = readFileSync(new URL("../docs/database/026_google_review_sync.sql", import.meta.url), "utf8");
const service = readFileSync(new URL("./google-review-sync-service.ts", import.meta.url), "utf8");

test("Google review sync uses an idempotent business-scoped Google review identity", () => {
  assert.match(migration, /add column if not exists google_review_id text/);
  assert.match(migration, /unique \(business_id, google_review_id\)/);
  assert.match(service, /onConflict: "business_id,google_review_id"/);
  assert.match(service, /google_review_id: review\.googleReviewId/);
});

test("Google review sync writes the mapped Google review fields", () => {
  assert.match(service, /author_name: nonEmptyText\(review\.author\.displayName/);
  assert.match(service, /content: nonEmptyText\(review\.comment/);
  assert.match(service, /created_at: safeCreatedAt\(review\.createdAt\)/);
  assert.match(service, /rating: review\.rating/);
  assert.match(service, /source: "google"/);
});

test("Google review sync treats an owner reply returned by Google as the published source of truth", () => {
  assert.match(service, /const reviewsWithGoogleReplies = result\.reviews\.flatMap/);
  assert.match(service, /const replyText = review\.ownerReply\?\.comment\?\.trim\(\)/);
  assert.match(service, /response_published_at: safeCreatedAt\(review\.ownerReply\?\.updatedAt \?\? null\)/);
  assert.match(service, /response_status: "responded"/);
  assert.match(service, /response_text: replyText/);
  assert.match(service, /\.upsert\(reviewsWithGoogleReplies, \{ onConflict: "business_id,google_review_id" \}\)/);
});

test("Google review sync preserves a local draft when a published Google reply was removed externally", () => {
  assert.match(service, /const googleReviewIdsInSync = result\.reviews\.flatMap/);
  assert.match(service, /const googleReviewIdsWithOwnerReplies = new Set\(reviewsWithGoogleReplies\.map/);
  assert.match(service, /\.eq\("response_status", "responded"\)/);
  assert.match(service, /const repliesRemovedInGoogle = \(respondedGoogleReviews \?\? \[\]\)/);
  assert.match(service, /response_published_at: null/);
  assert.match(service, /response_status: "ready"/);
  assert.doesNotMatch(
    service.slice(service.indexOf("const repliesRemovedInGoogle"), service.indexOf("return {\n      skipped:")),
    /response_text:/,
  );
});

test("Google review sync never changes ready or pending drafts when Google has no owner reply", () => {
  const reconciliation = service.slice(
    service.indexOf("const { data: respondedGoogleReviews"),
    service.indexOf("return {\n      skipped:"),
  );

  assert.match(reconciliation, /\.eq\("response_status", "responded"\)/);
  assert.doesNotMatch(reconciliation, /\.eq\("response_status", "pending"\)/);
});

test("Google review sync reconciles only review IDs returned by Google", () => {
  const reconciliation = service.slice(
    service.indexOf("const googleReviewIdsInSync"),
    service.indexOf("return {\n      skipped:"),
  );

  assert.match(reconciliation, /\.in\("google_review_id", googleReviewIdsInSync\)/);
  assert.match(reconciliation, /\.in\("id", repliesRemovedInGoogle\)/);
});

test("manual sync still requires a session and an active managed business before using the shared service", () => {
  assert.match(manualRoute, /supabase\.auth\.getUser\(\)/);
  assert.match(manualRoute, /requireActiveBusinessForUser\(supabase, user\.id, "id", "manage"\)/);
  assert.match(manualRoute, /syncClaimedGoogleReviewConnection\(connection\)/);
  assert.doesNotMatch(manualRoute, /fetchGoogleLocationReviews/);
});
