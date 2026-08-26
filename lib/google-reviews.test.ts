import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { mapGoogleReview } from "./google-review-mapping.ts";

const googleReviews = readFileSync(new URL("./google-reviews.ts", import.meta.url), "utf8");

test("Google review mapper preserves the fields needed for a future review record", () => {
  const result = mapGoogleReview({
    name: "accounts/123/locations/456/reviews/789",
    reviewId: "789",
    reviewer: { displayName: "Anna K.", isAnonymous: false, profilePhotoUrl: "https://example.test/photo" },
    starRating: "FIVE",
    comment: "Świetna obsługa.",
    createTime: "2026-08-24T09:30:00Z",
    updateTime: "2026-08-24T10:00:00Z",
    reviewReply: { comment: "Dziękujemy!", updateTime: "2026-08-24T10:10:00Z", reviewReplyState: "APPROVED" },
  });

  assert.deepEqual(result, {
    googleReviewId: "789",
    resourceName: "accounts/123/locations/456/reviews/789",
    author: { displayName: "Anna K.", isAnonymous: false, profilePhotoUrl: "https://example.test/photo" },
    rating: 5,
    comment: "Świetna obsługa.",
    createdAt: "2026-08-24T09:30:00Z",
    updatedAt: "2026-08-24T10:00:00Z",
    ownerReply: { comment: "Dziękujemy!", updatedAt: "2026-08-24T10:10:00Z", state: "APPROVED" },
  });
});

test("Google review mapper handles rating-only and anonymous reviews", () => {
  const result = mapGoogleReview({ starRating: "ONE", reviewer: { isAnonymous: true } });

  assert.equal(result.rating, 1);
  assert.equal(result.comment, null);
  assert.deepEqual(result.author, { displayName: null, isAnonymous: true, profilePhotoUrl: null });
  assert.equal(result.ownerReply, null);
});

test("Google review fetch follows every nextPageToken before returning reviews", () => {
  assert.match(googleReviews, /let pageToken: string \| null = null/);
  assert.match(googleReviews, /url\.searchParams\.set\("pageToken", pageToken\)/);
  assert.match(googleReviews, /reviews\.push\(\.\.\.\(data\.reviews \?\? \[\]\)\.map\(mapGoogleReview\)\)/);
  assert.match(googleReviews, /pageToken = data\.nextPageToken \?\? null/);
  assert.match(googleReviews, /\} while \(pageToken\)/);
  assert.match(googleReviews, /nextPageToken: null/);
});
