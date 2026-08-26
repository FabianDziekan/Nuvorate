import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { isAllowedSupportAttachment, isPaymentSupportCategory, supportAttachmentLimitBytes } from "./support-request.ts";

test("support request accepts only validated PNG, JPEG and PDF attachments", () => {
  const png = new File([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])], "screen.png", { type: "image/png" });
  const fakePng = new File(["not an image"], "screen.png", { type: "image/png" });
  assert.equal(isAllowedSupportAttachment(png, new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])), true);
  assert.equal(isAllowedSupportAttachment(fakePng, new Uint8Array([1, 2, 3])), false);
  assert.equal(supportAttachmentLimitBytes, 5 * 1024 * 1024);
});

test("support request classifies billing categories", () => {
  assert.equal(isPaymentSupportCategory("Zwrot płatności"), true);
  assert.equal(isPaymentSupportCategory("Płatność lub subskrypcja"), true);
  assert.equal(isPaymentSupportCategory("Problem techniczny"), false);
});

test("support endpoint derives all protected context server-side", () => {
  const source = readFileSync(new URL("../app/api/support/route.ts", import.meta.url), "utf8");
  assert.match(source, /supabase\.auth\.getUser\(\)/);
  assert.match(source, /getActiveBusinessBillingContext\(/);
  assert.match(source, /claim_support_request_slot/);
  assert.match(source, /replyTo: user\.email/);
  assert.doesNotMatch(source, /formData\.get\("businessId"\)/);
  assert.doesNotMatch(source, /formData\.get\("userId"\)/);
});

test("support rate limit migration is authenticated-only and atomic", () => {
  const migration = readFileSync(new URL("../docs/database/025_support_request_rate_limit.sql", import.meta.url), "utf8");
  assert.match(migration, /security definer/);
  assert.match(migration, /auth\.uid\(\)/);
  assert.match(migration, /on conflict \(user_id\) do update/);
  assert.match(migration, /revoke all on function public\.claim_support_request_slot\(\) from public/);
  assert.match(migration, /grant execute on function public\.claim_support_request_slot\(\) to authenticated/);
});
