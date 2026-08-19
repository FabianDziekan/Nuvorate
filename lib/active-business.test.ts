import test from "node:test";
import assert from "node:assert/strict";
import {
  canManageBusiness,
  isRequestedBusinessActive,
  selectActiveMembership,
} from "./active-business.ts";

test("active business selects the oldest membership deterministically", () => {
  const active = selectActiveMembership([
    { business_id: "second", role: "member", created_at: "2026-02-01T00:00:00.000Z" },
    { business_id: "first", role: "owner", created_at: "2026-01-01T00:00:00.000Z" },
  ]);
  assert.equal(active?.business_id, "first");
});

test("no membership has no active business", () => {
  assert.equal(selectActiveMembership([]), null);
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
