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
