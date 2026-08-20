import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  canManageBusiness,
  getActiveBusinessForUser,
  isRequestedBusinessActive,
  selectActiveMembership,
  selectPreferredActiveMembership,
} from "./active-business.ts";

function resolverSupabase({
  memberships,
  activeBusinessId,
  businesses,
}: {
  memberships: Array<{ business_id: string; role: "owner" | "admin" | "member"; created_at: string }>;
  activeBusinessId: string | null;
  businesses: Record<string, { id: string; name: string }>;
}) {
  return {
    from(table: string) {
      if (table === "business_memberships") {
        return {
          select: () => ({
            eq: () => ({
              order: async () => ({ data: memberships, error: null }),
            }),
          }),
        };
      }
      if (table === "profiles") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: { active_business_id: activeBusinessId },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === "businesses") {
        return {
          select: () => ({
            eq: (_field: string, businessId: string) => ({
              maybeSingle: async () => ({ data: businesses[businessId] ?? null, error: null }),
            }),
          }),
        };
      }
      throw new Error(`Unexpected table: ${table}`);
    },
  };
}

test("active business selects the oldest membership deterministically", () => {
  const active = selectActiveMembership([
    { business_id: "second", role: "member", created_at: "2026-02-01T00:00:00.000Z" },
    { business_id: "first", role: "owner", created_at: "2026-01-01T00:00:00.000Z" },
  ]);
  assert.equal(active?.business_id, "first");
});

test("no membership has no active business", () => {
  assert.equal(selectActiveMembership([]), null);
  assert.equal(selectPreferredActiveMembership([], "foreign"), null);
});

test("a persisted active business is selected only when the user still has that membership", () => {
  const memberships = [
    { business_id: "fallback", role: "owner" as const, created_at: "2026-01-01T00:00:00.000Z" },
    { business_id: "preferred", role: "member" as const, created_at: "2026-02-01T00:00:00.000Z" },
  ];

  assert.equal(
    selectPreferredActiveMembership(memberships, "preferred")?.business_id,
    "preferred",
  );
  assert.equal(
    selectPreferredActiveMembership(memberships, "foreign")?.business_id,
    "fallback",
  );
});

test("the resolver prefers a persisted business that belongs to the user", async () => {
  const active = await getActiveBusinessForUser(
    resolverSupabase({
      memberships: [
        { business_id: "fallback", role: "owner", created_at: "2026-01-01T00:00:00.000Z" },
        { business_id: "preferred", role: "member", created_at: "2026-02-01T00:00:00.000Z" },
      ],
      activeBusinessId: "preferred",
      businesses: {
        fallback: { id: "fallback", name: "Fallback" },
        preferred: { id: "preferred", name: "Preferred" },
      },
    }),
    "user",
  );

  assert.equal(active?.business.id, "preferred");
});

test("the resolver never uses a persisted id when the user has no memberships", async () => {
  const active = await getActiveBusinessForUser(
    resolverSupabase({
      memberships: [],
      activeBusinessId: "foreign",
      businesses: { foreign: { id: "foreign", name: "Foreign" } },
    }),
    "user",
  );

  assert.equal(active, null);
});

test("a null persisted selection keeps the deterministic membership fallback", () => {
  const memberships = [
    { business_id: "second", role: "admin" as const, created_at: "2026-02-01T00:00:00.000Z" },
    { business_id: "first", role: "member" as const, created_at: "2026-01-01T00:00:00.000Z" },
  ];

  assert.equal(
    selectPreferredActiveMembership(memberships, null)?.business_id,
    "first",
  );
});

test("a stale selected business falls back without granting access beyond memberships", async () => {
  const active = await getActiveBusinessForUser(
    resolverSupabase({
      memberships: [
        { business_id: "fallback", role: "owner", created_at: "2026-01-01T00:00:00.000Z" },
        { business_id: "stale", role: "member", created_at: "2026-02-01T00:00:00.000Z" },
      ],
      activeBusinessId: "stale",
      businesses: { fallback: { id: "fallback", name: "Fallback" } },
    }),
    "user",
    "id, name",
  );

  assert.equal(active?.business.id, "fallback");
  assert.equal(active?.membership.business_id, "fallback");
});

test("all membership roles can select an accessible business; only management stays role-gated", () => {
  for (const role of ["owner", "admin", "member"] as const) {
    const membership = {
      business_id: role,
      role,
      created_at: "2026-01-01T00:00:00.000Z",
    };
    assert.equal(selectPreferredActiveMembership([membership], role)?.business_id, role);
  }
  assert.equal(canManageBusiness("member"), false);
});

test("management is limited to owner and admin", () => {
  assert.equal(canManageBusiness("owner"), true);
  assert.equal(canManageBusiness("admin"), true);
  assert.equal(canManageBusiness("member"), false);
});

test("a requested business id is accepted only when it is the verified active business", () => {
  assert.equal(isRequestedBusinessActive("active", "active"), true);
  assert.equal(isRequestedBusinessActive("active", "foreign"), false);
});

test("active business resolution stays read-only", () => {
  const source = readFileSync(join(process.cwd(), "lib/active-business.ts"), "utf8");
  const resolver = source.slice(
    source.indexOf("export async function getActiveBusinessForUser"),
    source.indexOf("export async function requireActiveBusinessForUser"),
  );
  assert.doesNotMatch(resolver, /\.update\(/);
  assert.doesNotMatch(resolver, /\.upsert\(/);
});
