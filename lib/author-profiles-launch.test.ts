import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { AUTHOR_PROFILES_ENABLED } from "./author-profiles-launch.ts";
const source = (path: string) => readFileSync(path, "utf8");

test("launch disables page and endpoint before session or Google work", () => {
  assert.equal(AUTHOR_PROFILES_ENABLED, false);
  const page = source("app/author-verification/page.tsx");
  const api = source("app/api/author-google-profiles/route.ts");
  assert.match(page, /export default async function AuthorVerificationPage\(\) \{\s*if \(!AUTHOR_PROFILES_ENABLED\) notFound\(\);/);
  assert.match(api, /export async function GET\(\) \{\s*if \(!AUTHOR_PROFILES_ENABLED\) return json\(\{ error: "Not found" \}, 404\);/);
});

test("launch removes navigation and Polish/English plan promotion", () => {
  for (const path of ["dashboard", "analysis", "reviews", "responses", "notifications", "settings", "nfc", "support"]) {
    assert.doesNotMatch(source(`app/(dashboard)/${path}/page.tsx`), /href: "\/author-verification"/);
  }
  assert.doesNotMatch(source("app/author-verification/page.tsx"), /href: "\/author-verification"/);
  assert.doesNotMatch(source("components/navigation/mobile-bottom-navigation-client.tsx"), /author-verification/);
  assert.doesNotMatch(source("components/dashboard/dashboard-demo.tsx"), /Autorzy opinii/);
  assert.doesNotMatch(source("lib/landing-translations.ts"), /Weryfikacja autorów opinii|Review author verification/);
});

test("launch retains implementation and applied migrations", () => {
  for (const path of ["lib/google-author-profile-matching.ts", "lib/google-author-profile-request.ts", "lib/google-author-profile.test.ts", "components/author-verification/author-verification-list.tsx", "docs/database/035_author_verification_foundation.sql", "docs/database/036_author_verification_manual_match_method.sql"]) assert.ok(existsSync(path), path);
});
