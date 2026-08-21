import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { validateGoogleReviewUrl, validateNfcTagInput } from "./nfc.ts";

test("NFC accepts only HTTPS Google review destinations", () => {
  assert.equal(
    validateGoogleReviewUrl("https://g.page/r/example/review"),
    "https://g.page/r/example/review",
  );
  assert.equal(
    validateGoogleReviewUrl("https://maps.app.goo.gl/example"),
    "https://maps.app.goo.gl/example",
  );
  assert.equal(validateGoogleReviewUrl("http://google.com/review"), null);
  assert.equal(validateGoogleReviewUrl("https://google.com.evil.test"), null);
  assert.equal(validateGoogleReviewUrl("https://example.com"), null);
});

test("NFC tag input requires a name and a safe destination", () => {
  assert.equal(
    "error" in
      validateNfcTagInput({ name: "", destinationUrl: "https://g.page/x" }),
    true,
  );
  assert.deepEqual(
    validateNfcTagInput({
      name: "Plakietka przy kasie",
      destinationUrl: "https://share.google/example",
    }),
    {
      name: "Plakietka przy kasie",
      destinationUrl: "https://share.google/example",
    },
  );
});

test("NFC integrity migration declares a composite tag/business foreign key", () => {
  const migration = readFileSync(
    join(
      process.cwd(),
      "docs/database/024_nfc_scan_business_integrity.sql",
    ),
    "utf8",
  );

  assert.match(
    migration,
    /unique \(id, business_id\)/,
    "nfc_tags must expose a unique key for the exact tag/business pair",
  );
  assert.match(
    migration,
    /foreign key \(tag_id, business_id\)\s+references public\.nfc_tags \(id, business_id\)\s+on delete cascade/i,
    "a scan may reference only a matching tag/business pair and must retain tag deletion cascade",
  );
  assert.match(
    migration,
    /drop constraint %I/,
    "the legacy tag-only FK must be replaced structurally rather than assumed by name",
  );
});
