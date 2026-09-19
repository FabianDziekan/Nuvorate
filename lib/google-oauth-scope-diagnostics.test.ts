import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function source(path: string) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

const callback = source("app/api/google/callback/route.ts");
const googleBusiness = source("lib/google-business.ts");
const settings = source("app/(dashboard)/settings/page.tsx");
const connectionCard = source("components/settings/google-connection-card.tsx");

test("reported Business scope is checked before Accounts API and an absent scope is not assumed", () => {
  assert.match(callback, /const scopeWasReported = typeof token\.scope === "string"/);
  assert.match(callback, /if \(scopeWasReported && !hasBusinessManage\)/);
  assert.match(callback, /return fail\("missing_business_scope", "missing_business_scope"\)/);
  assert.match(callback, /business_manage_granted=\$\{scopeWasReported \? hasBusinessManage : "unknown"\}/);
  assert.doesNotMatch(callback, /granted_scopes=/);
});

test("Accounts API 403 becomes a safe missing-scope error and never exposes a provider body", () => {
  assert.match(googleBusiness, /accounts_fetch_failed status=\$\{accountsResponse\.status\}/);
  assert.match(callback, /error\.stage === "accounts" && error\.status === 403/);
  assert.doesNotMatch(googleBusiness, /accountsResponse\.text\(\)/);
  assert.doesNotMatch(googleBusiness, /response\.text\(\)/);
});

test("OAuth callback separates cancellation and expired-session failures", () => {
  assert.match(callback, /oauthError === "access_denied"/);
  assert.match(callback, /fail\("cancelled", "cancelled"\)/);
  assert.match(callback, /fail\("session_expired", "session_expired"\)/);
});

test("save errors use a safe redirect code and failures log only a safe stage", () => {
  assert.match(callback, /const fail = \(stage: string, error: string\)/);
  assert.match(callback, /\[Google OAuth\] failure_stage=\$\{stage\}/);
  assert.match(callback, /fail\("save", "save"\)/);
  assert.doesNotMatch(callback, /console\.(?:info|error)\([^;]*(?:access_token|refresh_token|client_secret|code_verifier|state)\b/);
});

test("settings show actionable Polish OAuth messages and retry starts a new OAuth flow", () => {
  for (const error of ["cancelled", "missing_business_scope", "session_expired", "no_locations", "google_unavailable", "save"]) {
    assert.match(settings, new RegExp(`${error}:`));
  }
  assert.match(connectionCard, /href="\/api\/google\/connect"/);
  assert.match(connectionCard, /retry \? "Spróbuj ponownie" : "Połącz z Google"/);
});
