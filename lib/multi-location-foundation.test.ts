import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  new URL("../docs/database/021_multi_location_memberships_foundation.sql", import.meta.url),
  "utf8",
);

test("multi-location migration removes the one-owner-one-business constraint safely", () => {
  assert.match(migration, /from pg_catalog\.pg_constraint constraint_entry/);
  assert.match(migration, /constraint_entry\.contype = 'u'/);
  assert.match(migration, /constraint_entry\.conkey = array\[v_owner_attnum\]::smallint\[\]/);
  assert.match(migration, /Expected exactly one UNIQUE constraint on public\.businesses\(owner_id\)/);
  assert.match(migration, /alter table public\.businesses drop constraint %I/);
  assert.match(migration, /A UNIQUE index on public\.businesses\(owner_id\) remains/);
  assert.match(migration, /create table if not exists public\.business_memberships/);
  assert.match(migration, /unique \(user_id, business_id\)/);
  assert.match(migration, /insert into public\.business_memberships[\s\S]*on conflict \(user_id, business_id\)/);
  assert.match(migration, /create trigger businesses_create_owner_membership/);
});

test("transition guard allows only one browser-created business and serializes concurrent creation", () => {
  assert.match(
    migration,
    /create policy "Owners can create their first business during transition"[\s\S]*owner_id = \(select auth\.uid\(\)\)[\s\S]*not exists \([\s\S]*business_memberships/,
  );
  assert.match(
    migration,
    /create or replace function public\.enforce_single_business_during_transition\(\)[\s\S]*pg_advisory_xact_lock[\s\S]*business_memberships/,
  );
  assert.match(
    migration,
    /create trigger businesses_enforce_single_business_during_transition[\s\S]*before insert on public\.businesses/,
  );
});

test("multi-location RLS is based on memberships for every business-scoped table", () => {
  assert.match(migration, /create or replace function public\.can_access_business/);
  assert.match(migration, /create or replace function public\.can_manage_business/);

  for (const table of [
    "businesses",
    "reviews",
    "ai_review_responses",
    "ai_business_analyses",
    "business_response_settings",
    "business_analysis_automation",
    "nfc_tags",
    "nfc_scans",
    "notifications",
    "google_business_connections",
  ]) {
    assert.match(
      migration,
      new RegExp(`on public\\.${table}[\\s\\S]{0,900}public\\.can_(?:access|manage)_business`),
      `${table} must use membership-aware RLS`,
    );
  }
});

test("ordinary members cannot mutate location data and authenticated clients cannot update business owner_id", () => {
  assert.match(migration, /membership\.role in \('owner'::public\.business_membership_role, 'admin'::public\.business_membership_role\)/);
  assert.match(migration, /revoke update on table public\.businesses from authenticated/);
  assert.match(migration, /grant update \([\s\S]*monthly_review_goal[\s\S]*\) on table public\.businesses to authenticated/);
  assert.match(migration, /revoke all on table public\.business_memberships from anon, authenticated/);
  assert.match(migration, /revoke select on table public\.google_business_connections from authenticated/);
  assert.match(migration, /google_location_title,[\s\S]*updated_at[\s\S]*\) on table public\.google_business_connections to authenticated/);
  assert.doesNotMatch(
    migration.match(/grant select \([\s\S]*?\) on table public\.google_business_connections to authenticated/)?.[0] ?? "",
    /encrypted_refresh_token/,
  );
});
