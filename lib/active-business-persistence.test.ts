import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const migration = readFileSync(
  join(process.cwd(), "docs/database/022_active_business_persistence.sql"),
  "utf8",
);

test("active business persistence is nullable and clears when its business is deleted", () => {
  assert.match(migration, /add column if not exists active_business_id uuid/);
  assert.match(
    migration,
    /foreign key \(active_business_id\)[\s\S]*references public\.businesses\(id\)[\s\S]*on delete set null/,
  );
});

test("only the checked RPC can select an active business", () => {
  assert.match(migration, /revoke update on table public\.profiles from authenticated/);
  assert.match(migration, /grant update \(full_name, first_name\) on table public\.profiles to authenticated/);
  assert.match(migration, /create or replace function public\.set_active_business\(p_business_id uuid\)/);
  assert.match(migration, /security definer[\s\S]*set search_path = ''/);
  assert.match(migration, /v_user_id uuid := \(select auth\.uid\(\)\)/);
  assert.doesNotMatch(migration, /p_user_id/);
  assert.match(migration, /revoke all on function public\.set_active_business\(uuid\) from public, anon, authenticated/);
  assert.match(migration, /grant execute on function public\.set_active_business\(uuid\) to authenticated/);
});

test("the RPC rejects a foreign business id using the current membership", () => {
  assert.match(
    migration,
    /from public\.business_memberships membership[\s\S]*membership\.user_id = v_user_id[\s\S]*membership\.business_id = p_business_id/,
  );
  assert.match(migration, /raise exception 'The authenticated user cannot select this business'/);
});

test("membership removal clears a now-invalid active business preference", () => {
  assert.match(migration, /create or replace function public\.clear_active_business_after_membership_delete\(\)/);
  assert.match(
    migration,
    /where user_id = old\.user_id[\s\S]*and active_business_id = old\.business_id/,
  );
  assert.match(
    migration,
    /create trigger business_memberships_clear_active_business[\s\S]*after delete on public\.business_memberships/,
  );
});

test("existing membership authorization remains the source of access control", () => {
  assert.match(migration, /business_memberships/);
  assert.match(migration, /active business selection[\s\S]*business_memberships/);
  assert.match(migration, /begin;[\s\S]*commit;/);
});
