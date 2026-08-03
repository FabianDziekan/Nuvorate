import assert from "node:assert/strict";
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
