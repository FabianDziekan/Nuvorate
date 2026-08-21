import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const serverSource = readFileSync(
  join(process.cwd(), "components/business/desktop-business-switcher.tsx"),
  "utf8",
);
const clientSource = readFileSync(
  join(process.cwd(), "components/business/desktop-business-switcher-client.tsx"),
  "utf8",
);

test("desktop switcher derives its list from current user memberships", () => {
  assert.match(serverSource, /getUserBusinessMemberships\(supabase, userId\)/);
  assert.match(serverSource, /memberships\.map\(\(membership\) => membership\.business_id\)/);
  assert.match(serverSource, /\.select\("id, name, industry, city"\)\s*\.in\("id", businessIds\)/);
  assert.match(serverSource, /businessIds[\s\S]*?\.map\(\(businessId\) => byId\.get\(businessId\)\)/);
});

test("desktop switcher only opens a menu to switch businesses or create an entitled location", () => {
  assert.match(clientSource, /const canSwitch = businesses\.length > 1/);
  assert.match(clientSource, /const canOpenMenu = canSwitch \|\| isBillingOwner/);
  assert.match(clientSource, /\{canOpenMenu \? \(/);
  assert.match(clientSource, /\) : \(\n        <div className=/);
  assert.match(serverSource, /catch \{[\s\S]*?businesses = \[\];/);
});

test("desktop switcher marks the resolver-selected active business", () => {
  assert.match(clientSource, /const active = business\.id === activeBusiness\.id/);
  assert.match(clientSource, /aria-checked=\{active\}/);
  assert.match(clientSource, /\{active \? <CheckIcon/);
});

test("desktop switcher switches only through the central server action", () => {
  assert.match(clientSource, /setActiveBusinessAction\(businessId\)/);
  assert.doesNotMatch(clientSource, /createAdminClient|service_role|supabase\.rpc|active_business_id/);
});

test("desktop switcher creates locations only through the central server action", () => {
  assert.match(clientSource, /createBusinessLocationAction\(\{/);
  assert.match(clientSource, /name: form\.get\("name"\)/);
  assert.match(clientSource, /industry: form\.get\("industry"\)/);
  assert.match(clientSource, /city: form\.get\("city"\)/);
  assert.match(clientSource, /googleReviewUrl: form\.get\("googleReviewUrl"\)/);
  assert.match(clientSource, /if \(isPending \|\| !canCreateLocation\) return;/);
  assert.match(clientSource, /disabled=\{isPending \|\| !canCreateLocation\}/);
  assert.match(clientSource, /router\.refresh\(\);/);
  assert.doesNotMatch(clientSource, /createAdminClient|service_role|supabase\.rpc|owner_id|user_id|extra_location_count/);
});

test("desktop switcher displays authoritative location usage and the limit state", () => {
  assert.match(serverSource, /getActiveBusinessBillingContext\(/);
  assert.match(serverSource, /billingContext\.billingOwnerId === userId/);
  assert.match(serverSource, /\.eq\("owner_id", billingContext\.billingOwnerId\)/);
  assert.match(serverSource, /billingContext\.extraLocationCount/);
  assert.match(serverSource, /ownerLocationCount < allowedLocationCount/);
  assert.match(clientSource, /\{locationUsage\.current\} z \{locationUsage\.allowed\} lokalizacji/);
  assert.match(clientSource, /Wykorzystano limit lokalizacji planu Business\./);
});

test("desktop switcher keeps the prior business displayed until a successful action", () => {
  assert.match(clientSource, /if \(!result\.success\) \{[\s\S]*?setError\(result\.error\);[\s\S]*?return;/);
  assert.match(clientSource, /setOpen\(false\);\n      router\.refresh\(\);/);
  assert.match(clientSource, /if \(isPending \|\| businessId === activeBusiness\.id\) return;/);
});

test("desktop switcher preserves its desktop layout with long names", () => {
  assert.match(clientSource, /className="block truncate text-sm font-semibold text-ink"/);
  assert.match(clientSource, /className="block truncate text-sm font-semibold"/);
  assert.match(clientSource, /className="mt-0\.5 block truncate text-xs text-black\/40"/);
});
