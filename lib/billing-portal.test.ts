import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { billingPortalGet, billingPortalPost } from "./billing-portal.ts";

const appUrl = "https://www.nuvorate.pl";
const portalUrl = "https://billing.stripe.com/p/session/mock";
const source = (path: string) => readFileSync(path, "utf8");
function fixture() {
  const calls: string[] = [];
  const deps = {
    async getUser(): Promise<{ id: string } | null> { calls.push("auth"); return { id: "owner-a" }; },
    async getBillingContext(id: string): Promise<{ billingOwnerId: string } | null> { calls.push("context:" + id); return { billingOwnerId: "owner-a" }; },
    async getCustomerId(id: string): Promise<string | null> { calls.push("customer:" + id); return "cus_mock_a"; },
    async createPortal(id: string) { calls.push("stripe:" + id); return { url: portalUrl }; },
  };
  return { calls, deps };
}
const request = (headers: Record<string, string> = { origin: appUrl }) => new Request(appUrl + "/billing/portal", {
  method: "POST", headers, body: "business_id=foreign&customer_id=cus_foreign",
});

test("GET only redirects to settings; route has no auth or Stripe operation in GET", () => {
  const response = billingPortalGet(appUrl);
  assert.equal(response.status, 303);
  assert.equal(response.headers.get("location"), appUrl + "/settings");
  assert.match(source("app/billing/portal/route.ts"), /export function GET\(\) \{\s*return billingPortalGet\(getAppUrl\(\)\);\s*\}/);
});
for (const headers of [{}, { origin: "null" }, { origin: "https://evil.example" }, { origin: appUrl, "sec-fetch-site": "cross-site" }]) {
  test("invalid origin is rejected before dependencies: " + JSON.stringify(headers), async () => {
    const { calls, deps } = fixture();
    assert.equal((await billingPortalPost(request(headers), appUrl, deps)).status, 403);
    assert.deepEqual(calls, []);
  });
}
test("unauthenticated POST returns safe login next and never reads customer or calls Stripe", async () => {
  const { calls, deps } = fixture();
  deps.getUser = async () => null;
  const response = await billingPortalPost(request(), appUrl, deps);
  assert.equal(response.status, 303);
  const location = new URL(response.headers.get("location")!);
  assert.equal(location.pathname, "/login");
  assert.equal(location.searchParams.get("next"), "/settings");
  assert.deepEqual(calls, []);
});
for (const context of [null, { billingOwnerId: "owner-b" }]) {
  test("missing membership or foreign billing owner fails closed: " + JSON.stringify(context), async () => {
    const { calls, deps } = fixture();
    deps.getBillingContext = async () => context;
    assert.equal((await billingPortalPost(request(), appUrl, deps)).status, 403);
    assert.deepEqual(calls, ["auth"]);
  });
}
test("billing owner creates exactly one session for server customer; client IDs ignored", async () => {
  const { calls, deps } = fixture();
  const response = await billingPortalPost(request(), appUrl, deps);
  assert.equal(response.status, 303);
  assert.equal(response.headers.get("location"), portalUrl);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(calls, ["auth", "context:owner-a", "customer:owner-a", "stripe:cus_mock_a"]);
});
test("missing customer is distinct and never calls Stripe", async () => {
  const { calls, deps } = fixture();
  deps.getCustomerId = async () => null;
  assert.equal((await billingPortalPost(request(), appUrl, deps)).status, 409);
  assert.ok(!calls.some(c => c.startsWith("stripe:")));
});
test("Stripe failure is generic, contains no raw error, and is never retried", async () => {
  const { calls, deps } = fixture();
  deps.createPortal = async () => { calls.push("stripe"); throw new Error("secret_mock cus_private stacktrace"); };
  const response = await billingPortalPost(request(), appUrl, deps);
  assert.equal(response.status, 502);
  assert.doesNotMatch(await response.text(), /secret_mock|cus_private|stacktrace/);
  assert.equal(calls.filter(c => c === "stripe").length, 1);
});
test("resolver failure stops customer lookup and Stripe", async () => {
  const { calls, deps } = fixture();
  deps.getBillingContext = async () => { throw new Error("private"); };
  assert.equal((await billingPortalPost(request(), appUrl, deps)).status, 502);
  assert.deepEqual(calls, ["auth"]);
});
test("untrusted portal redirect is rejected", async () => {
  const { deps } = fixture();
  deps.createPortal = async () => ({ url: "https://evil.example/session" });
  const response = await billingPortalPost(request(), appUrl, deps);
  assert.equal(response.status, 502);
  assert.equal(response.headers.get("location"), null);
});
test("route uses canonical business resolver and server-scoped customer lookup", () => {
  const route = source("app/billing/portal/route.ts");
  assert.match(route, /getActiveBusinessBillingContext\(client, userId, "id"\)/);
  assert.match(route, /client\.auth\.getUser\(\)/);
  assert.match(route, /\.eq\("user_id", userId\)/);
  assert.doesNotMatch(route, /request\.(json|formData)|console\.error/);
});
test("all six entry points submit native POST instead of Next Link", () => {
  let count = 0;
  for (const path of ["dashboard", "settings", "support"]) {
    const ui = source("app/(dashboard)/" + path + "/page.tsx");
    assert.doesNotMatch(ui, /href=["']\/billing\/portal/);
    const forms = ui.match(/<form method="post" action="\/billing\/portal"><button type="submit"/g) ?? [];
    assert.equal(forms.length, path === "settings" ? 4 : 1);
    count += forms.length;
  }
  assert.equal(count, 6);
});
