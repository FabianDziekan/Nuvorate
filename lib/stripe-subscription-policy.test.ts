import assert from "node:assert/strict";
import test from "node:test";
import { planForStripeSubscriptionStatus } from "./stripe-subscription-policy.ts";

test("active and trialing subscriptions retain their mapped plan", () => {
  assert.equal(planForStripeSubscriptionStatus("active", "starter"), "starter");
  assert.equal(planForStripeSubscriptionStatus("trialing", "business"), "business");
});

test("past_due does not revoke access after a single failed invoice", () => {
  assert.equal(planForStripeSubscriptionStatus("past_due", "business"), "business");
});

test("terminal and non-entitled Stripe states revoke access", () => {
  for (const status of [
    "canceled",
    "unpaid",
    "incomplete",
    "incomplete_expired",
    "paused",
  ]) {
    assert.equal(planForStripeSubscriptionStatus(status, "starter"), "unpaid");
  }
});

test("an entitled subscription with an unknown Price ID fails safely", () => {
  assert.throws(() => planForStripeSubscriptionStatus("active", null));
});
