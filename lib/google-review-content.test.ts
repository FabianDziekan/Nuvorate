import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { mapGoogleReview } from "./google-review-mapping.ts";
import { normalizeGoogleReviewContent } from "./google-review-content.ts";

test("keeps only the author original when Google appends one translated version", () => {
  assert.equal(
    normalizeGoogleReviewContent(
      "Świetna karma. (Translated by Google) Great food.",
    ),
    "Świetna karma.",
  );
});

test("keeps the original after Google's translated-first block", () => {
  for (const input of [
    "(Translated by Google) Great place (Original) Świetne miejsce",
    "  (tRaNsLaTeD   By   gOoGlE)\nGreat place 😊\n(ORIGINAL)\nŚwietne miejsce 🍔  ",
    "Translated by Google\r\nGreat place\r\nOriginal\r\nŚwietne miejsce",
    "(Translated by Google) Great place\nOriginal\nŚwietne miejsce",
  ]) {
    const clean = normalizeGoogleReviewContent(input);
    assert.equal(clean, input.includes("🍔") ? "Świetne miejsce 🍔" : "Świetne miejsce");
    assert.doesNotMatch(clean ?? "", /translated by google|\(original\)/i);
  }
});

test("keeps the author text before a translated suffix across whitespace and case variants", () => {
  for (const input of [
    "Świetna i jakościowa karma, polecam! (Translated by Google) Great quality food...",
    "Świetna karma 😊\n\n(TRANSLATED   BY   GOOGLE)\nGreat food",
    "Świetna karma\nTranslated by Google\nGreat food",
  ]) {
    const clean = normalizeGoogleReviewContent(input);
    assert.equal(clean, input.includes("😊") ? "Świetna karma 😊" : input.startsWith("Świetna karma") ? "Świetna karma" : "Świetna i jakościowa karma, polecam!");
    assert.doesNotMatch(clean ?? "", /translated by google|\(original\)/i);
  }
});

test("does not truncate ordinary or ambiguous author text", () => {
  for (const input of [
    "Original recipe, translated with care.",
    "The word Original is part of our brand.",
    "My translated by Google note is not a Google block.",
    "Great place (Original) is the name of the restaurant.",
    "(Translated by Google) Great food.",
    "Original text (Translated by Google)",
    "(Translated by Google) Translation (Original)",
    "Original (Translated by Google) translation (Original) actual text",
    "Loved the place (Translated by Google) English (Translated by Google) more text",
    "Normal review\nOriginal\nstill normal",
  ]) assert.equal(normalizeGoogleReviewContent(input), input);
});

test("leaves ordinary Polish, English, and empty review text unchanged", () => {
  assert.equal(normalizeGoogleReviewContent("Bardzo dobra obsługa."), "Bardzo dobra obsługa.");
  assert.equal(normalizeGoogleReviewContent("Great service."), "Great service.");
  assert.equal(normalizeGoogleReviewContent(""), "");
  assert.equal(normalizeGoogleReviewContent(null), null);
});

test("leaves ambiguous translation-marker text unchanged", () => {
  const ambiguous = "(Translated by Google) Great food.";
  assert.equal(normalizeGoogleReviewContent(ambiguous), ambiguous);
});

test("Google mapper normalizes new and repeated sync payloads before a review can be upserted", () => {
  const googlePayload = {
    reviewId: "google-review-123",
    comment: "Świetna karma, polecam! (Translated by Google) Great food, I recommend it!",
  };

  const firstSync = mapGoogleReview(googlePayload);
  const repeatedSync = mapGoogleReview(googlePayload);

  assert.equal(firstSync.comment, "Świetna karma, polecam!");
  assert.equal(repeatedSync.comment, "Świetna karma, polecam!");
  assert.doesNotMatch(firstSync.comment ?? "", /\(Translated by Google\)/);
  assert.doesNotMatch(repeatedSync.comment ?? "", /\(Translated by Google\)/);
  assert.equal(mapGoogleReview({ ...googlePayload, comment: "(Translated by Google) Great place (Original) Świetne miejsce" }).comment, "Świetne miejsce");
  const sync = readFileSync("lib/google-review-sync-service.ts", "utf8");
  assert.match(sync, /content: nonEmptyText\(review\.comment, "Opinia bez treści\."\)/);
  assert.match(sync, /\.upsert\(reviewsToUpsert, \{ onConflict: "business_id,google_review_id" \}\)/);
});

test("notification previews are built from the already-normalized review and repaired from linked reviews", () => {
  const trigger = readFileSync("docs/database/040_notification_event_chronology.sql", "utf8");
  const backfill = readFileSync("docs/database/041_clean_google_review_translation_artifacts.sql", "utf8");
  assert.match(trigger, /'contentPreview', left\(normalized_content, 120\)/);
  assert.match(backfill, /review\.id = linked_review_id/);
  assert.match(backfill, /review\.business_id = notification_row\.business_id/);
  assert.match(backfill, /jsonb_set\(payload, '\{contentPreview\}', to_jsonb\(preview\), false\)/);
  assert.doesNotMatch(backfill, /set is_read|set occurred_at|set created_at/i);
  const clean = normalizeGoogleReviewContent("(Translated by Google) Great place (Original) Świetne miejsce")!;
  assert.equal(clean.replace(/\s+/g, " ").trim().slice(0, 120), "Świetne miejsce");
});

test("both recognized Google formats produce marker-free AI inputs", () => {
  for (const comment of [
    "(Translated by Google) Great place (Original) Świetne miejsce",
    "Świetna karma 😊 (Translated by Google) Great food",
  ]) {
    const mapped = mapGoogleReview({ comment });
    const aiInput = JSON.stringify({ review: { content: normalizeGoogleReviewContent(mapped.comment) } });
    assert.doesNotMatch(aiInput, /translated by google|\(original\)/i);
  }
  for (const path of [
    "lib/business-analysis-service.ts",
    "app/dashboard/review-response-service.ts",
    "lib/automatic-review-response-service.ts",
  ]) {
    assert.match(readFileSync(path, "utf8"), /normalizeGoogleReviewContent\(review\.content\)/);
  }
});

test("historical display and AI inputs normalize stored Google translation bundles", () => {
  const reviewsPage = readFileSync("app/(dashboard)/reviews/page.tsx", "utf8");
  const dashboardPage = readFileSync("app/(dashboard)/dashboard/page.tsx", "utf8");
  const responseCard = readFileSync("components/responses/response-card.tsx", "utf8");
  const notificationUi = readFileSync("lib/notification-ui.ts", "utf8");
  const analysisService = readFileSync("lib/business-analysis-service.ts", "utf8");
  const manualResponseService = readFileSync("app/dashboard/review-response-service.ts", "utf8");
  const automaticResponseService = readFileSync("lib/automatic-review-response-service.ts", "utf8");

  for (const source of [
    reviewsPage,
    dashboardPage,
    responseCard,
    notificationUi,
    analysisService,
    manualResponseService,
    automaticResponseService,
  ]) {
    assert.match(source, /normalizeGoogleReviewContent/);
  }
});
