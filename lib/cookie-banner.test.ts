import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const banner = readFileSync(new URL("../components/legal/cookie-banner.tsx", import.meta.url), "utf8");

test("first visit keeps the existing banner and accepting persists its decision", () => {
  assert.match(banner, /getItem\(cookieConsentKey\)/);
  assert.match(banner, /setDecision\(stored === "accepted" \|\| stored === "declined" \? stored : null\)/);
  assert.match(banner, /setItem\(cookieConsentKey, "accepted"\)/);
  assert.match(banner, /Używamy plików cookies/);
  assert.match(banner, /Akceptuję/);
});

test("floating control only appears after a decision and reopens the same banner", () => {
  assert.match(banner, /if \(decision === "loading"\) return null/);
  assert.match(banner, /if \(decision !== null && !settingsOpen\)/);
  assert.match(banner, /onClick=\{\(\) => setSettingsOpen\(true\)\}/);
  assert.match(banner, /aria-label="Ustawienia cookies"/);
  assert.match(banner, /role="tooltip"/);
  assert.match(banner, /focus-visible:ring-2/);
  assert.match(banner, /safe-area-inset-bottom/);
});

test("reopened banner can withdraw consent and the decision survives refresh", () => {
  assert.match(banner, /setItem\(cookieConsentKey, "declined"\)/);
  assert.match(banner, /settingsOpen && decision === "accepted"/);
  assert.match(banner, /Wycofaj zgodę/);
  assert.match(banner, /onClick=\{\(\) => setSettingsOpen\(false\)\}/);
});
