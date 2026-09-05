import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const route = readFileSync(
  join(process.cwd(), "app/api/internal/google-places-author-uri-test/route.ts"),
  "utf8",
);
const googleBusiness = readFileSync(join(process.cwd(), "lib/google-business.ts"), "utf8");

test("temporary Places diagnostic uses the existing internal secret and a business-scoped connection", () => {
  assert.match(route, /process\.env\.GOOGLE_REVIEW_SYNC_SECRET\?\.trim\(\)/);
  assert.match(route, /\.eq\("business_id", body\.businessId\)/);
  assert.match(route, /\.eq\("status", "connected"\)/);
});

test("temporary Places diagnostic reads the API key server-side and performs one minimal Places request", () => {
  assert.match(route, /process\.env\.GOOGLE_PLACES_API_KEY\?\.trim\(\)/);
  assert.equal((route.match(/places\.googleapis\.com\/v1\/places/g) ?? []).length, 1);
  assert.match(route, /"X-Goog-FieldMask": "reviews,userRatingCount"/);
  assert.doesNotMatch(route, /while\s*\(|retry/i);
});

test("temporary Places diagnostic obtains Place ID from GBP metadata without database writes", () => {
  assert.match(route, /fetchGoogleLocationPlaceId\(accessToken, connection\.google_location_id\)/);
  assert.match(googleBusiness, /readMask", "name,title,metadata\.placeId"/);
  assert.doesNotMatch(route, /\.insert\(|\.update\(|\.upsert\(|\.delete\(/);
});

test("temporary Places diagnostic returns the exact Google author URI and never constructs one", () => {
  assert.match(route, /exampleAuthorUri: example\?\.uri \?\? null/);
  assert.match(route, /review\.authorAttribution\?\.uri/);
  assert.doesNotMatch(route, /maps\/contrib\/\$\{|displayName.*maps\/contrib/);
});
