import assert from "node:assert/strict";
import test from "node:test";
import {
  getAnalysisFeedback,
  isStarterAnalysisLimitReached,
  normalizeAnalysisErrorCode,
} from "./analysis-feedback.ts";

test("Starter analysis limit is recognized only at 1 of 1", () => {
  assert.equal(
    isStarterAnalysisLimitReached({
      analysesLimit: 1,
      analysesUsed: 1,
      plan: "starter",
    }),
    true,
  );
  assert.equal(
    isStarterAnalysisLimitReached({
      analysesLimit: 1,
      analysesUsed: 0,
      plan: "starter",
    }),
    false,
  );
  assert.equal(
    isStarterAnalysisLimitReached({
      analysesLimit: 50,
      analysesUsed: 50,
      plan: "business",
    }),
    false,
  );
});

test("Analysis errors map to distinct, safe feedback", () => {
  const limit = getAnalysisFeedback("limit", "starter");
  const noReviews = getAnalysisFeedback("no_reviews", "starter");
  const technical = getAnalysisFeedback("technical", "starter");

  assert.equal(limit.showBusinessCta, true);
  assert.match(limit.description, /1 z 1/);
  assert.equal(noReviews.showBusinessCta, false);
  assert.match(noReviews.description, /Brak opinii/);
  assert.equal(technical.showBusinessCta, false);
  assert.equal(
    technical.description,
    "Nie udało się wygenerować analizy. Spróbuj ponownie.",
  );
});

test("Only supported URL error codes are accepted", () => {
  assert.equal(normalizeAnalysisErrorCode("limit"), "limit");
  assert.equal(normalizeAnalysisErrorCode("no_reviews"), "no_reviews");
  assert.equal(normalizeAnalysisErrorCode("technical"), "technical");
  assert.equal(normalizeAnalysisErrorCode("database exploded"), null);
});
