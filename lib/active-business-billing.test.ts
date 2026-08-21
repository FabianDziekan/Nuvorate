import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import {
  billingContextFrom,
  fieldsWithBillingOwner,
} from "./active-business-billing-context.ts";

const resolverSource = readFileSync(
  join(process.cwd(), "lib/active-business-billing.ts"),
  "utf8",
);

function source(path: string) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

const activeBusiness = (role: "owner" | "admin" | "member" = "admin") => ({
  business: {
    id: "business-a",
    owner_id: "billing-owner-a",
  },
  membership: {
    business_id: "business-a",
    created_at: "2026-08-01T00:00:00.000Z",
    role,
  },
});

test("Business owner plan is used for an admin with a Starter profile", () => {
  const context = billingContextFrom(
    activeBusiness("admin"),
    "operator-starter",
    { plan: "business", subscription_status: "active", extra_location_count: 0 },
  );

  assert.equal(context.plan, "business");
  assert.equal(context.billingOwnerId, "billing-owner-a");
  assert.equal(context.operatorUserId, "operator-starter");
  assert.equal(context.membershipRole, "admin");
});

test("Business owner plan is used for an unpaid member", () => {
  const context = billingContextFrom(
    activeBusiness("member"),
    "operator-unpaid",
    { plan: "business", subscription_status: "active", extra_location_count: 0 },
  );

  assert.equal(context.plan, "business");
  assert.equal(context.membershipRole, "member");
});

test("An operator Business plan cannot upgrade a Starter location", () => {
  const context = billingContextFrom(
    activeBusiness("admin"),
    "operator-business",
    { plan: "starter", subscription_status: "active", extra_location_count: 0 },
  );

  assert.equal(context.plan, "starter");
});

test("Switching locations changes the resolved billing owner and plan", () => {
  const first = billingContextFrom(
    activeBusiness("admin"),
    "operator",
    { plan: "starter", subscription_status: "active", extra_location_count: 0 },
  );
  const second = billingContextFrom(
    {
      ...activeBusiness("admin"),
      business: { id: "business-b", owner_id: "billing-owner-b" },
      membership: { ...activeBusiness("admin").membership, business_id: "business-b" },
    },
    "operator",
    { plan: "business", subscription_status: "active", extra_location_count: 2 },
  );

  assert.deepEqual([first.billingOwnerId, first.plan], ["billing-owner-a", "starter"]);
  assert.deepEqual([second.billingOwnerId, second.plan], ["billing-owner-b", "business"]);
});

test("The resolver adds owner_id to a restricted business projection", () => {
  assert.equal(fieldsWithBillingOwner("id, name"), "id, name, owner_id");
  assert.equal(fieldsWithBillingOwner("id, owner_id"), "id, owner_id");
});

test("Billing resolution starts with membership-backed Active Business Context", () => {
  assert.match(resolverSource, /getActiveBusinessForUser<Record<string, any>>\(/);
  assert.match(resolverSource, /if \(!activeBusiness\) return null;/);
  assert.match(resolverSource, /\.eq\("user_id", billingOwnerId\)/);
  assert.ok(
    resolverSource.indexOf("getActiveBusinessForUser<Record<string, any>>") <
      resolverSource.indexOf("const admin = createAdminClient()"),
  );
});

test("AI usage is charged to the billing owner rather than the operator", () => {
  const dashboardActions = source("app/dashboard/actions.ts");
  const responseService = source("app/dashboard/review-response-service.ts");

  assert.match(dashboardActions, /userId:\s*billingContext\.billingOwnerId/);
  assert.match(responseService, /userId:\s*billingContext\.billingOwnerId/);
  assert.match(responseService, /completeAiUsageReservation\([\s\S]*?billingContext\.billingOwnerId/);
  assert.match(responseService, /releaseAiUsageReservation\([\s\S]*?billingContext\.billingOwnerId/);
});

test("Business-only response endpoints gate against the active location billing plan", () => {
  for (const path of [
    "app/api/responses/auto-generate/route.ts",
    "app/api/responses/settings/route.ts",
    "app/dashboard/actions.ts",
    "app/nfc/actions.ts",
  ]) {
    const file = source(path);
    assert.match(file, /(?:require|get)ActiveBusinessBillingContext/);
    assert.match(file, /billingContext\.plan/);
  }
});

test("response endpoints reject a request after its active location becomes stale", () => {
  for (const path of [
    "app/api/responses/auto-generate/route.ts",
    "app/api/responses/settings/route.ts",
  ]) {
    const file = source(path);
    const contextIndex = file.lastIndexOf("requireActiveBusinessBillingContext(");
    const staleRequestCheckIndex = file.indexOf(
      "billingContext.activeBusiness.business.id !== businessId",
    );
    const planGateIndex = file.lastIndexOf("hasPlanCapability");

    assert.ok(contextIndex >= 0);
    assert.ok(staleRequestCheckIndex > contextIndex);
    assert.ok(planGateIndex > staleRequestCheckIndex);
    assert.match(file, /status:\s*409/);
    assert.doesNotMatch(file, /requireRequestedActiveBusiness/);
  }
});

test("Active location pages resolve their displayed plan through the billing context", () => {
  for (const path of [
    "app/dashboard/page.tsx",
    "app/reviews/page.tsx",
    "app/analysis/page.tsx",
    "app/responses/page.tsx",
    "app/author-verification/page.tsx",
    "app/nfc/page.tsx",
    "app/notifications/page.tsx",
    "app/settings/page.tsx",
  ]) {
    assert.match(source(path), /getActiveBusinessBillingContext/);
  }
});
