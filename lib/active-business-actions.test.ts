import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const source = readFileSync(
  join(process.cwd(), "app/active-business/actions.ts"),
  "utf8",
);
const persistenceMigration = readFileSync(
  join(process.cwd(), "docs/database/022_active_business_persistence.sql"),
  "utf8",
);

test("active business action validates an untrusted UUID before using Supabase", () => {
  assert.match(source, /typeof businessId !== "string" \|\| !uuidPattern\.test\(businessId\)/);
  assert.ok(
    source.indexOf("typeof businessId") < source.indexOf("await createClient()"),
  );
  assert.match(source, /\^\[0-9a-f\]\{8\}/);
});

test("active business action requires an authenticated server session", () => {
  assert.match(source, /await supabase\.auth\.getUser\(\)/);
  assert.match(source, /if \(userError \|\| !user\)/);
  assert.ok(
    source.indexOf("await supabase.auth.getUser()") < source.indexOf("supabase.rpc"),
  );
});

test("active business action delegates final membership authorization to the authenticated RPC", () => {
  assert.match(source, /supabase\.rpc\([\s\S]*?"set_active_business"[\s\S]*?p_business_id: businessId/);
  assert.doesNotMatch(source, /createAdminClient|service_role/);
  assert.doesNotMatch(source, /\.from\("profiles"\)[\s\S]*?\.update\(/);
  assert.doesNotMatch(source, /canManageBusiness|role ===/);
});

test("owner, admin, and member selection stays membership-based rather than role-gated", () => {
  const rpc = persistenceMigration.slice(
    persistenceMigration.indexOf("create or replace function public.set_active_business"),
    persistenceMigration.indexOf("revoke all on function public.set_active_business"),
  );
  assert.match(rpc, /membership\.user_id = v_user_id/);
  assert.match(rpc, /membership\.business_id = p_business_id/);
  assert.doesNotMatch(rpc, /membership\.role|can_manage_business/);
});

test("active business action keeps foreign and stale ids indistinguishable to the client", () => {
  assert.match(source, /if \(error \|\| selectedBusinessId !== businessId\)/);
  assert.match(source, /Nie udało się zmienić aktywnej firmy/);
  assert.doesNotMatch(source, /nie masz dostępu|firma istnieje/i);
});

test("only a successful selection revalidates every active-business page", () => {
  const successIndex = source.indexOf("for (const path of activeBusinessPaths)");
  const failureIndex = source.indexOf("if (error || selectedBusinessId !== businessId)");
  assert.ok(successIndex > failureIndex);
  for (const path of [
    "/dashboard",
    "/reviews",
    "/analysis",
    "/responses",
    "/author-verification",
    "/nfc",
    "/notifications",
    "/settings",
  ]) {
    assert.match(source, new RegExp(`"${path}"`));
  }
  assert.match(source, /revalidatePath\(path\)/);
});
