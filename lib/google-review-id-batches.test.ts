import assert from "node:assert/strict";
import test from "node:test";

import {
  batchGoogleReviewIds,
  collectBatchedGoogleReviews,
  GOOGLE_REVIEW_ID_FILTER_MAX_LENGTH,
  removedGoogleReplyReviewIds,
} from "./google-review-id-batches.ts";

function encodedFilterLength(ids: string[]) {
  const values = ids.map((id) => /[,()]/.test(id) ? `"${id}"` : id).join(",");
  return new URLSearchParams({ google_review_id: `in.(${values})` }).toString().length;
}

test("small ID lists use one batch and empty lists make no request", async () => {
  assert.deepEqual(batchGoogleReviewIds(["a", "b", "a"]), [["a", "b"]]);
  assert.deepEqual(batchGoogleReviewIds([]), []);
  let calls = 0;
  assert.deepEqual(await collectBatchedGoogleReviews([], async () => { calls++; return []; }), []);
  assert.equal(calls, 0);
});

test("more than 500 Limone-length IDs remain below the encoded filter budget", () => {
  const ids = Array.from({ length: 528 }, (_, index) => `${String(index).padStart(4, "0")}${"x".repeat(74)}`);
  const batches = batchGoogleReviewIds(ids);
  assert.ok(batches.length > 1);
  assert.deepEqual(batches.flat(), ids);
  assert.ok(batches.every((batch) => encodedFilterLength(batch) <= GOOGLE_REVIEW_ID_FILTER_MAX_LENGTH));
});

test("very large inputs preserve order, remove duplicates and bound every batch by URL length", () => {
  const ids = Array.from({ length: 4000 }, (_, index) => `${index}-${"x".repeat(index % 100)}`);
  const batches = batchGoogleReviewIds([...ids, ...ids]);
  assert.ok(batches.length > 10);
  assert.deepEqual(batches.flat(), ids);
  assert.ok(batches.every((batch) => encodedFilterLength(batch) <= GOOGLE_REVIEW_ID_FILTER_MAX_LENGTH));
  assert.throws(() => batchGoogleReviewIds(["x".repeat(GOOGLE_REVIEW_ID_FILTER_MAX_LENGTH)]), RangeError);
});

test("results from all batches are combined once and preserve removed-reply logic", async () => {
  const ids = Array.from({ length: 120 }, (_, index) => `review-${index}-${"x".repeat(70)}`);
  const batchesSeen: string[][] = [];
  const rows = await collectBatchedGoogleReviews(ids, async (batch) => {
    batchesSeen.push(batch);
    return [
      ...batch.map((id) => ({ id, google_review_id: id })),
      { id: ids[0], google_review_id: ids[0] },
    ];
  });
  assert.ok(batchesSeen.length > 1);
  assert.equal(rows.length, ids.length);
  assert.deepEqual(rows.map((row) => row.id), ids);
  assert.deepEqual(
    removedGoogleReplyReviewIds(rows, new Set(ids.slice(0, 119))),
    [ids[119]],
  );
  assert.deepEqual(removedGoogleReplyReviewIds(rows, new Set(ids)), []);
});

test("one failed Supabase batch aborts reconciliation without returning partial results", async () => {
  const ids = Array.from({ length: 120 }, (_, index) => `review-${index}-${"x".repeat(70)}`);
  let calls = 0;
  await assert.rejects(
    collectBatchedGoogleReviews(ids, async (batch) => {
      calls++;
      if (calls === 2) throw new Error("Supabase SELECT failed");
      return batch.map((id) => ({ id }));
    }),
    /Supabase SELECT failed/,
  );
  assert.equal(calls, 2);
});
