import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const page = readFileSync(join(process.cwd(), "app/(dashboard)/dashboard/page.tsx"), "utf8");

test("latest review cards clamp displayed text without truncating review data", () => {
  assert.match(page, /latestReviews\.map\(\(review, index\) => \(/);
  assert.match(page, /line-clamp-4[^\n]*max-\[768px\]:line-clamp-2/);
  assert.match(page, /\{normalizeGoogleReviewContent\(review\.content\)\}/);
  assert.doesNotMatch(page, /review\.content\.(?:slice|substring|truncate)\(/);
});

test("desktop cards have aligned bottom actions while mobile keeps natural height", () => {
  assert.match(page, /className=\{`flex h-full flex-col[^`]*lg:min-h-\[236px\]/);
  assert.match(page, /<div className="mt-auto">\s*<ReviewResponseForm/);
  assert.match(page, /lg:grid-cols-3/);
  assert.match(page, /href="\/reviews" className="rounded-xl bg-brand-soft/);
});
