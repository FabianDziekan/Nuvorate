import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { hasPaidAccess } from "./billing-access.ts";
import { checkoutIntentQuery, parseCheckoutIntent } from "./checkout-intent.ts";

const source = (path: string) => readFileSync(join(process.cwd(), path), "utf8");

test("all four selected purchase intents survive signup and confirmation", () => {
  for (const plan of ["starter", "business"]) {
    for (const billing of ["monthly", "yearly"]) {
      const intent = parseCheckoutIntent(plan, billing);
      assert.ok(intent);
      assert.equal(checkoutIntentQuery(intent), `?plan=${plan}&billing=${billing}`);
    }
  }
  assert.equal(parseCheckoutIntent(null, "monthly"), null);
  assert.equal(parseCheckoutIntent("business", "bad"), null);
  assert.match(source("components/auth/register-form.tsx"), /emailRedirectTo:[\s\S]*?next/);
  assert.match(source("app/auth/callback/route.ts"), /exchangeCodeForSession\(code\)/);
});

test("paid access requires both a paid plan and an entitled Stripe status", () => {
  for (const status of ["active", "trialing", "past_due"]) {
    assert.equal(hasPaidAccess("starter", status), true);
    assert.equal(hasPaidAccess("business", status), true);
    assert.equal(hasPaidAccess("unpaid", status), false);
  }
  for (const status of ["canceled", "unpaid", "incomplete", "incomplete_expired", "paused", null]) {
    assert.equal(hasPaidAccess("business", status), false);
  }
});

test("one shared server layout blocks all product routes, activation remains outside", () => {
  const layout = source("app/(dashboard)/layout.tsx");
  assert.match(layout, /getDashboardUser\(\)/);
  assert.match(layout, /if \(!billingContext\) redirect\("\/onboarding"\)/);
  assert.match(layout, /!hasPaidAccess\(billingContext\.plan, billingContext\.subscriptionStatus\)/);
  assert.match(layout, /redirect\("\/activate"\)/);
  assert.doesNotMatch(source("app/activate/page.tsx"), /DashboardShell/);
});

test("onboarding keeps the protected creation RPC and does not require Google URL", () => {
  const action = source("app/onboarding/actions.ts");
  const form = source("components/onboarding/business-form.tsx");
  const migration = source("docs/database/039_optional_google_review_url_onboarding.sql");
  assert.match(action, /createBusinessLocationAction/);
  assert.match(action, /googleReviewUrl: null/);
  assert.doesNotMatch(form, /name="googleReviewUrl"/);
  assert.match(migration, /pg_catalog\.pg_advisory_xact_lock/);
  assert.match(migration, /where business\.owner_id = v_user_id/);
  assert.match(migration, /if v_current_location_count >= v_allowed_location_count then/);
  assert.match(migration, /nullif\(btrim\(p_google_review_url\), ''\)/);
  assert.doesNotMatch(migration, /p_google_review_url is null\s+or/);
});

test("Checkout return waits for webhook and active accounts cannot buy again", () => {
  const checkout = source("app/checkout/route.ts");
  const stripe = source("lib/stripe.ts");
  assert.match(checkout, /hasPaidAccess\(billingContext\.plan, billingContext\.subscriptionStatus\)/);
  assert.match(checkout, /if \(!billingContext\)/);
  assert.match(stripe, /\/activate\?checkout=success/);
  assert.match(stripe, /\/activate\?checkout=cancel/);
  assert.match(source("app/activate/page.tsx"), /CheckoutActivationStatus/);
  assert.match(source("app/api/billing/status/route.ts"), /hasPaidAccess\(plan, subscriptionStatus\)/);
});
