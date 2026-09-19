import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function source(path: string) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

const callback = source("app/api/google/callback/route.ts");
const googleBusiness = source("lib/google-business.ts");

test("OAuth callback logs only granted scopes and the Business scope decision", () => {
  assert.match(callback, /const grantedScopes = \(token\.scope \?\? ""\)\.split/);
  assert.match(callback, /\[Google OAuth\] granted_scopes=\$\{grantedScopes\.join\(" "\)\}/);
  assert.match(callback, /grantedScopes\.includes\("https:\/\/www\.googleapis\.com\/auth\/business\.manage"\)/);
  assert.match(callback, /\[Google OAuth\] business_manage_granted=\$\{hasBusinessManage\}/);
  assert.doesNotMatch(
    callback,
    /console\.info\([^;]*(?:access_token|refresh_token|client_secret|code_verifier)\b/,
  );
});

test("Accounts API failure logs its HTTP status without the provider body", () => {
  assert.match(googleBusiness, /\[Google OAuth\] accounts_fetch_failed status=\$\{accountsResponse\.status\}/);
  assert.doesNotMatch(
    googleBusiness,
    /accountsResponse\.text\(\)/,
  );
});
