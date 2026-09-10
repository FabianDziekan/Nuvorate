import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { loadDashboardRequestContext } from "./dashboard-request-context-loader.ts";
import { hasPlanCapability, normalizePlan } from "./plans.ts";

const require = createRequire(import.meta.url);
const ts = require("typescript");
// Exercise the installed React server cache, not a replacement memoizer.
// The dispatcher represents the fresh cache root supplied by each RSC render.
const react = require(join(dirname(require.resolve("react")), "cjs/react.react-server.development.js"));
const internals = react.__SERVER_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
async function render(fn: () => Promise<unknown>): Promise<any> {
  const previous = internals.A;
  const roots = new Map();
  internals.A = { getCacheForType(factory: () => unknown) {
    if (!roots.has(factory)) roots.set(factory, factory());
    return roots.get(factory);
  } };
  try { return await fn(); } finally { internals.A = previous; }
}

function fixture() {
  const state = {
    userId: "owner", active: "a", plan: "business", role: "owner",
    memberships: ["a", "b"], listError: false, profileError: false,
    countThrows: false, billingError: false,
  };
  const reads: string[] = [];
  function client(admin: boolean) {
    return {
      auth: { async getUser() { reads.push("auth"); return { data: { user: { id: state.userId } } }; } },
      from(table: string) {
        let fields = "";
        const eq: Record<string, unknown> = {};
        let ids: string[] | undefined;
        let head = false;
        const query: any = {
          select(value: string, options?: { head?: boolean }) { fields = value; head = !!options?.head; return query; },
          eq(key: string, value: unknown) { eq[key] = value; return query; },
          in(key: string, value: string[]) { assert.equal(key, "id"); ids = value; return query; },
          order() { return query; }, limit() { return query; }, maybeSingle() { return query; },
          then(resolve: (value: unknown) => unknown, reject: (error: unknown) => unknown) {
            return Promise.resolve().then(() => {
              reads.push(`${admin ? "admin" : "user"}:${table}:${fields}`);
              if (table === "business_memberships") {
                assert.equal(eq.user_id, state.userId);
                return { data: state.memberships.map(business_id => ({ business_id, role: state.role, created_at: "2026-01-01" })), error: null };
              }
              if (table === "profiles" && !admin) {
                assert.equal(eq.user_id, state.userId);
                return { data: { first_name: "Test", active_business_id: state.active }, error: state.profileError ? { message: "error" } : null };
              }
              if (table === "notifications") {
                const authorizedActiveBusiness = state.memberships.includes(state.active)
                  ? state.active
                  : state.memberships[0];
                assert.equal(eq.business_id, authorizedActiveBusiness);
                return head ? { count: 0, error: null } : { data: [], error: null };
              }
              if (table === "profiles") {
                assert.equal(eq.user_id, "owner");
                return { data: { plan: state.plan, extra_location_count: 1, subscription_status: "active" }, error: state.billingError ? {} : null };
              }
              if (head) {
                assert.equal(eq.owner_id, "owner");
                if (state.countThrows) throw new Error("count unavailable");
                return { count: 2, error: null };
              }
              if (ids) {
                assert.deepEqual(ids, state.memberships);
                if (state.listError) return { data: null, error: {} };
                // A defensive filter must even reject an unexpected foreign result.
                return { data: [...ids, "foreign"].map(id => ({ id, name: id })), error: null };
              }
              assert.ok(state.memberships.includes(eq.id as string));
              return { data: { id: eq.id, owner_id: "owner", name: eq.id }, error: null };
            }).then(resolve, reject);
          },
        };
        return query;
      },
    };
  }
  const supabase = client(false);
  const admin = client(true);
  const source = readFileSync(new URL("./dashboard-request-context.ts", import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const exports: any = {};
  new Function("require", "exports", compiled)((name: string) => {
    if (name === "server-only") return {};
    if (name === "react") return react;
    if (name.endsWith("supabase/server")) return { createClient: async () => supabase };
    if (name.endsWith("supabase/admin")) return { createAdminClient: () => admin };
    if (name === "./dashboard-request-context-loader") return { loadDashboardRequestContext };
    throw new Error(name);
  }, exports);
  return { state, reads, context: exports.getDashboardRequestContext, user: exports.getDashboardUser };
}

test("one render deduplicates auth and concurrent page/desktop/mobile context calls", async () => {
  const f = fixture();
  await render(async () => {
    await f.user();
    const [a, b, c] = await Promise.all([f.context("owner"), f.context("owner"), f.context("owner")]);
    assert.equal(a, b); assert.equal(b, c);
    assert.deepEqual(a.accessibleBusinesses.map((b: any) => b.id), ["a", "b"]);
  });
  assert.equal(f.reads.filter(r => r === "auth").length, 1);
  assert.equal(f.reads.filter(r => r.includes("business_memberships")).length, 1);
  assert.equal(f.reads.filter(r => r.startsWith("user:profiles")).length, 1);
  assert.equal(f.reads.filter(r => r.startsWith("admin:profiles")).length, 1);
  assert.equal(f.reads.filter(r => r === "user:businesses:id, name, industry, city").length, 1);
  assert.equal(f.reads.length, 9); // 8 DB reads + auth, independent of consumers.
});

test("next render re-reads active business after switching; no stale user data", async () => {
  const f = fixture();
  const before = await render(() => f.context("owner"));
  f.state.active = "b";
  f.state.userId = "member";
  f.state.role = "member";
  const after = await render(() => f.context("member"));
  assert.notEqual(before, after);
  assert.equal(before.billingContext.activeBusiness.business.id, "a");
  assert.equal(after.billingContext.activeBusiness.business.id, "b");
  assert.equal(after.billingContext.operatorUserId, "member");
  assert.equal(f.reads.filter(r => r === "auth").length, 2);
});

test("context refuses an ID different from the authenticated user", async () => {
  const f = fixture();
  await render(() => assert.rejects(f.context("foreign"), /sesji/));
  assert.deepEqual(f.reads, ["auth"]);
});

test("foreign active preference cannot grant business access", async () => {
  const f = fixture(); f.state.active = "foreign";
  const c = await render(() => f.context("owner"));
  assert.equal(c.billingContext.activeBusiness.business.id, "a");
  assert.ok(!c.accessibleBusinesses.some((b: any) => b.id === "foreign"));
});

test("missing membership yields no active context or privileged billing read", async () => {
  const f = fixture(); f.state.memberships = [];
  const c = await render(() => f.context("owner"));
  assert.equal(c.billingContext, null);
  assert.equal(c.accessibleBusinesses.length, 0);
  assert.ok(!f.reads.some(r => r.startsWith("admin:")));
});

for (const plan of ["unpaid", "starter", "business"]) {
  test(`context retains ${plan} gating`, async () => {
    const f = fixture(); f.state.plan = plan;
    const c = await render(() => f.context("owner"));
    assert.equal(hasPlanCapability(c.billingContext.plan, "reviews"), plan !== "unpaid");
    assert.equal(hasPlanCapability(c.billingContext.plan, "fullAnalysis"), plan === "business");
  });
}
for (const role of ["owner", "admin", "member"]) {
  test(`context retains ${role} role and billing owner`, async () => {
    const f = fixture(); f.state.role = role; f.state.userId = role;
    const c = await render(() => f.context(role));
    assert.equal(c.billingContext.membershipRole, role);
    assert.equal(c.billingContext.billingOwnerId, "owner");
    assert.equal(c.billingContext.plan, "business");
    assert.equal(f.reads.filter(r => r === "admin:businesses:id").length, role === "owner" ? 1 : 0);
  });
}

test("optional location list failure preserves authorized active business", async () => {
  const f = fixture(); f.state.listError = true;
  const c = await render(() => f.context("owner"));
  assert.equal(c.billingContext.activeBusiness.business.id, "a");
  assert.equal(c.businessListAvailable, false);
  assert.deepEqual(c.accessibleBusinesses, []);
});
test("optional owner count exception hides creation entitlement", async () => {
  const f = fixture(); f.state.countThrows = true;
  const c = await render(() => f.context("owner"));
  assert.equal(c.ownerLocationCountAvailable, false);
  assert.equal(c.billingContext.plan, "business");
});
test("profile and billing errors remain failures, not unpaid fallbacks", async () => {
  const f = fixture(); f.state.profileError = true;
  await render(() => assert.rejects(f.context("owner"), /preferowanej/));
  f.state.profileError = false; f.state.billingError = true;
  await render(() => assert.rejects(f.context("owner"), /planu właściciela/));
});
test("all eight pages use the shared request context without a separate first_name query", () => {
  for (const route of ["dashboard", "reviews", "analysis", "responses", "nfc", "notifications", "settings", "support"]) {
    const s = readFileSync(`app/(dashboard)/${route}/page.tsx`, "utf8");
    assert.match(s, /getDashboardRequestContext\(user.id\)/);
    assert.doesNotMatch(s, /\.select\("first_name"\)/);
    assert.match(s, /getDashboardUser\(\)/);
    if (route !== "support") assert.match(s, /supabase.auth.getClaims\(\)/);
  }
});

test("desktop and mobile consume resolved context without any additional Supabase reads", async () => {
  const f = fixture();
  const context = await render(() => f.context("owner"));
  for (const kind of ["desktop", "mobile"]) {
    const source = readFileSync(`components/business/${kind}-business-switcher.tsx`, "utf8");
    const compiled = ts.transpileModule(source, { compilerOptions: {
      module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX,
    } }).outputText;
    const exports: any = {};
    new Function("require", "exports", compiled)((name: string) => {
      if (name === "react/jsx-runtime") return require(name);
      if (name === "@/lib/plans") return { normalizePlan };
      if (name.endsWith("-business-switcher-client")) return {
        DesktopBusinessSwitcherClient: () => null, MobileBusinessSwitcherClient: () => null,
      };
      return new Proxy({}, { get() { return () => { throw new Error(`Unexpected read: ${name}`); }; } });
    }, exports);
    const Component = kind === "desktop" ? exports.DesktopBusinessSwitcher : exports.MobileBusinessSwitcher;
    const result = await Component({ userId: "owner", dashboardContext: context,
      billingContext: context.billingContext, activeBusiness: context.billingContext.activeBusiness.business,
      plan: "Business" });
    assert.equal(result.props.activeBusiness.id, "a");
    assert.deepEqual(result.props.businesses.map((b: any) => b.id), ["a", "b"]);
  }
  assert.equal(f.reads.length, 9);
});
