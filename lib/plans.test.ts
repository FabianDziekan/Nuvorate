import assert from "node:assert/strict";
import test from "node:test";
import {
  getAiLimit,
  hasPlanCapability,
  normalizePlan,
  PlanCapabilityError,
  requirePlanCapability,
} from "./plans.ts";

test("Starter exposes only the agreed foundational capabilities", () => {
  assert.equal(hasPlanCapability("starter", "basicDashboard"), true);
  assert.equal(hasPlanCapability("starter", "manualReviewResponses"), true);
  assert.equal(hasPlanCapability("starter", "basicAnalysis"), true);
  assert.equal(hasPlanCapability("starter", "businessInsights"), false);
  assert.equal(hasPlanCapability("starter", "fullAnalysis"), false);
  assert.equal(hasPlanCapability("starter", "authorVerification"), false);
  assert.equal(hasPlanCapability("starter", "automaticReviewResponses"), false);
  assert.equal(hasPlanCapability("starter", "automaticAnalysis"), false);
  assert.equal(hasPlanCapability("starter", "nfcAdvancedStats"), false);
});

test("Business inherits Starter and exposes Business capabilities", () => {
  assert.equal(hasPlanCapability("business", "manualReviewResponses"), true);
  assert.equal(hasPlanCapability("business", "basicAnalysis"), true);
  assert.equal(hasPlanCapability("business", "businessInsights"), true);
  assert.equal(hasPlanCapability("business", "fullAnalysis"), true);
  assert.equal(hasPlanCapability("business", "authorVerification"), true);
  assert.equal(hasPlanCapability("business", "automaticReviewResponses"), true);
  assert.equal(hasPlanCapability("business", "automaticAnalysis"), true);
  assert.equal(hasPlanCapability("business", "nfcAdvancedStats"), true);
});

test("Unpaid has no product capabilities", () => {
  assert.equal(hasPlanCapability("unpaid", "basicDashboard"), false);
  assert.equal(hasPlanCapability("unpaid", "reviews"), false);
  assert.equal(hasPlanCapability("unpaid", "notifications"), false);
});

test("Server capability assertion rejects direct Starter access", () => {
  assert.throws(
    () => requirePlanCapability("starter", "authorVerification"),
    PlanCapabilityError,
  );
  assert.doesNotThrow(() =>
    requirePlanCapability("business", "authorVerification"),
  );
});

test("Plan normalization is safe for persisted mixed-case values", () => {
  assert.equal(normalizePlan(" Starter "), "starter");
  assert.equal(normalizePlan("unknown"), "unpaid");
});

test("Monthly AI limits remain unchanged", () => {
  assert.equal(getAiLimit("starter", "reply"), 50);
  assert.equal(getAiLimit("starter", "analysis"), 1);
  assert.equal(getAiLimit("business", "reply"), 350);
  assert.equal(getAiLimit("business", "analysis"), 50);
});
