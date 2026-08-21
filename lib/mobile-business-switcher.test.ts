import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const serverSource = readFileSync(
  join(process.cwd(), "components/business/mobile-business-switcher.tsx"),
  "utf8",
);
const clientSource = readFileSync(
  join(process.cwd(), "components/business/mobile-business-switcher-client.tsx"),
  "utf8",
);
const dashboardSource = readFileSync(
  join(process.cwd(), "app/dashboard/page.tsx"),
  "utf8",
);

test("mobile switcher uses Active Business Billing Context and membership-derived locations", () => {
  assert.match(serverSource, /getActiveBusinessBillingContext\(supabase, userId/);
  assert.match(serverSource, /getUserBusinessMemberships\(supabase, userId\)/);
  assert.match(serverSource, /memberships\.length < 2\) return null/);
  assert.match(serverSource, /\.in\("id", businessIds\)/);
});

test("mobile switcher changes location only through the central server action", () => {
  assert.match(clientSource, /setOpen\(false\);\s*setError\(""\);\s*startTransition\(async \(\) => \{\s*const result = await setActiveBusinessAction\(businessId\)/);
  assert.match(clientSource, /setActiveBusinessAction\(businessId\)/);
  assert.match(clientSource, /router\.refresh\(\);/);
  assert.doesNotMatch(clientSource, /createAdminClient|service_role|supabase\.rpc|active_business_id/);
});

test("mobile switcher renders a fixed, centered dropdown below the dashboard header", () => {
  assert.match(clientSource, /className="hidden max-\[768px\]:block"/);
  assert.match(clientSource, /fixed left-1\/2 top-\[82px\] z-50 w-\[240px\]/);
  assert.match(clientSource, /-translate-x-1\/2 rounded-2xl/);
  assert.doesNotMatch(clientSource, /mobile-location-dropdown-in/);
  assert.doesNotMatch(clientSource, /bottom-0 max-h-\[70vh\]/);
});

test("dashboard renders the mobile switcher only in its mobile header", () => {
  assert.match(dashboardSource, /import \{ MobileBusinessSwitcher \} from "@\/components\/business\/mobile-business-switcher"/);
  assert.match(dashboardSource, /<MobileBusinessSwitcher userId=\{user\.id\} \/>/);
});
