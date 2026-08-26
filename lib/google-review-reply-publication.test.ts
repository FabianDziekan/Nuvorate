import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const publishRoute = readFileSync(
  join(process.cwd(), "app/api/responses/[id]/responded/route.ts"),
  "utf8",
);
const googleReviews = readFileSync(
  join(process.cwd(), "lib/google-reviews.ts"),
  "utf8",
);
const migration = readFileSync(
  join(process.cwd(), "docs/database/027_google_review_reply_publication.sql"),
  "utf8",
);
const responseCard = readFileSync(
  join(process.cwd(), "components/responses/response-card.tsx"),
  "utf8",
);
const deleteRoute = publishRoute.slice(
  publishRoute.indexOf("export async function DELETE"),
);

test("Google reply publication persists a dedicated publication timestamp", () => {
  assert.match(migration, /add column if not exists response_published_at timestamptz/);
  assert.match(publishRoute, /response_published_at: publication\.publishedAt/);
  assert.match(publishRoute, /response_status: "responded"/);
  assert.match(publishRoute, /response_text: publication\.responseText/);
  assert.doesNotMatch(publishRoute, /response_generated_at:/);
});

test("Google reply publication requires a session and an active managed location", () => {
  assert.match(publishRoute, /if \(!user\)/);
  assert.match(publishRoute, /requireActiveBusinessForUser\([\s\S]*?"id",[\s\S]*?"manage"/);
  assert.match(
    publishRoute,
    /\.eq\("id", id\)[\s\S]*?\.eq\("business_id", activeBusiness\.business\.id\)/,
  );
});

test("Google reply publication rejects a non-Google review or a review without Google identity", () => {
  assert.match(publishRoute, /review\.source !== "google" \|\| !review\.google_review_id/);
  assert.match(publishRoute, /Ta opinia nie jest połączona z Google Business Profile/);
});

test("Google reply publication sends the edited text to the official Google reply endpoint", () => {
  assert.match(googleReviews, /export async function publishGoogleLocationReviewReply/);
  assert.match(googleReviews, /reviews\/\$\{encodeURIComponent\(normalizedReviewId\)\}\/reply/);
  assert.match(googleReviews, /method: "PUT"/);
  assert.match(googleReviews, /body: JSON\.stringify\(\{ comment: normalizedReplyText \}\)/);
  assert.match(publishRoute, /publishGoogleLocationReviewReply\(/);
  assert.match(responseCard, /body: JSON\.stringify\(\{ responseText \}\)/);
});

test("an edited published reply is updated through the same Google PUT endpoint", () => {
  assert.match(responseCard, /const hasPublishedResponseChanges/);
  assert.match(responseCard, /"Zaktualizuj w Google"/);
  assert.match(responseCard, /"Aktualizowanie\.\.\."/);
  assert.match(publishRoute, /response_status: "responded"/);
  assert.match(publishRoute, /response_text: publication\.responseText/);
  assert.match(publishRoute, /response_published_at: publication\.publishedAt/);
});

test("Google API failure leaves the local response status unchanged", () => {
  const publishCallIndex = publishRoute.indexOf("publication = await publishGoogleLocationReviewReply");
  const localUpdateIndex = publishRoute.indexOf('.from("reviews")\n      .update({');

  assert.ok(publishCallIndex >= 0);
  assert.ok(localUpdateIndex > publishCallIndex);
  assert.match(publishRoute, /Nie udało się zapisać odpowiedzi w Google/);
});

test("Google reply deletion uses the official DELETE endpoint", () => {
  assert.match(googleReviews, /export async function deleteGoogleLocationReviewReply/);
  assert.match(googleReviews, /reviews\/\$\{encodeURIComponent\(normalizedReviewId\)\}\/reply/);
  assert.match(googleReviews, /method: "DELETE"/);
  assert.match(deleteRoute, /deleteGoogleLocationReviewReply\(/);
});

test("Google reply deletion requires a session and active managed business scope", () => {
  assert.match(deleteRoute, /if \(!user\)/);
  assert.match(deleteRoute, /requireActiveBusinessForUser\([\s\S]*?"id",[\s\S]*?"manage"/);
  assert.match(
    deleteRoute,
    /\.eq\("id", id\)[\s\S]*?\.eq\("business_id", activeBusiness\.business\.id\)/,
  );
});

test("Google reply deletion rejects non-Google, foreign, and unidentified reviews", () => {
  assert.match(deleteRoute, /review\.source !== "google"/);
  assert.match(deleteRoute, /!review\.google_review_id/);
  assert.match(deleteRoute, /review\.response_status !== "responded"/);
  assert.match(deleteRoute, /Ta odpowiedź nie może zostać usunięta z Google/);
});

test("successful Google reply deletion keeps the local draft and clears publication state", () => {
  const deleteCallIndex = deleteRoute.indexOf("await deleteGoogleLocationReviewReply");
  const localUpdateIndex = deleteRoute.indexOf('.from("reviews")\n      .update({');
  const localUpdate = deleteRoute.slice(localUpdateIndex, deleteRoute.indexOf(".maybeSingle()", localUpdateIndex));

  assert.ok(deleteCallIndex >= 0);
  assert.ok(localUpdateIndex > deleteCallIndex);
  assert.match(localUpdate, /response_published_at: null/);
  assert.match(localUpdate, /response_status: "ready"/);
  assert.doesNotMatch(localUpdate, /response_text:/);
});

test("Google reply deletion failure leaves local data untouched", () => {
  const deleteFailureIndex = deleteRoute.indexOf("Google review reply deletion failed");
  const localUpdateIndex = deleteRoute.indexOf('.from("reviews")\n      .update({');

  assert.ok(deleteFailureIndex >= 0);
  assert.ok(localUpdateIndex > deleteFailureIndex);
  assert.match(deleteRoute, /Nie udało się usunąć odpowiedzi z Google\. Spróbuj ponownie później/);
});
