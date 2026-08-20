import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const migration = readFileSync(
  join(process.cwd(), "docs/database/023_business_location_entitlements.sql"),
  "utf8",
);
const action = readFileSync(
  join(process.cwd(), "app/business-locations/actions.ts"),
  "utf8",
);
const onboarding = readFileSync(
  join(process.cwd(), "app/onboarding/actions.ts"),
  "utf8",
);

test("location entitlement is owned by the billing profile and cannot be negative", () => {
  assert.match(migration, /alter table public\.profiles[\s\S]*?extra_location_count integer not null default 0/);
  assert.match(migration, /check \(extra_location_count >= 0\)/);
  assert.match(migration, /when 'business'::public\.nuvorate_plan then 3/);
  assert.match(migration, /when 'starter'::public\.nuvorate_plan then 1/);
  assert.match(migration, /when 'unpaid'::public\.nuvorate_plan then 1/);
  assert.match(migration, /v_allowed_location_count := v_included_location_count[\s\S]*?v_extra_location_count/);
});

test("location creation is serialized per authenticated billing owner", () => {
  assert.match(migration, /v_user_id uuid := \(select auth\.uid\(\)\)/);
  assert.match(migration, /pg_catalog\.pg_advisory_xact_lock\([\s\S]*?hashtextextended\(v_user_id::text, 0\)/);
  assert.match(migration, /from public\.profiles profile[\s\S]*?for update/);
  assert.match(migration, /from public\.businesses business[\s\S]*?where business\.owner_id = v_user_id/);
  assert.match(migration, /if v_current_location_count >= v_allowed_location_count then/);
  assert.ok(
    migration.indexOf("if v_current_location_count >= v_allowed_location_count then") <
      migration.indexOf("insert into public.businesses"),
  );
});

test("the new location always belongs to the authenticated billing owner", () => {
  assert.match(migration, /if v_user_id is null then/);
  assert.match(migration, /owner_id,[\s\S]*?v_user_id,/);
  assert.doesNotMatch(migration, /p_owner_id/);
  assert.match(migration, /membership\.user_id = v_user_id[\s\S]*?membership\.business_id = v_business_id[\s\S]*?membership\.role = 'owner'/);
});

test("the transition guard is replaced atomically with controlled creation", () => {
  assert.match(migration, /revoke insert on table public\.businesses from authenticated/);
  assert.match(migration, /drop policy if exists "Owners can create their first business during transition"/);
  assert.match(migration, /drop trigger if exists businesses_enforce_single_business_during_transition/);
  assert.match(migration, /create or replace function public\.create_business_location/);
  assert.match(migration, /revoke all on function public\.create_business_location[\s\S]*?from public, anon, authenticated/);
  assert.match(migration, /grant execute on function public\.create_business_location[\s\S]*?to authenticated/);
});

test("the controlled server action does not trust client owner or limit data", () => {
  assert.match(action, /typeof input !== "object"/);
  assert.match(action, /await supabase\.auth\.getUser\(\)/);
  assert.match(action, /supabase\.rpc\([\s\S]*?"create_business_location"/);
  assert.doesNotMatch(action, /owner_id|extra_location_count|createAdminClient|service_role|\.from\("businesses"\)\.insert/);
});

test("onboarding uses the controlled location action instead of direct business inserts", () => {
  assert.match(onboarding, /createBusinessLocationAction/);
  assert.doesNotMatch(onboarding, /\.from\("businesses"\)\.insert/);
});
