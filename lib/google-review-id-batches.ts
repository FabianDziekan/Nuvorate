// Keep the encoded PostgREST `in.(...)` filter well below typical URL limits.
export const GOOGLE_REVIEW_ID_FILTER_MAX_LENGTH = 3000;

function encodedFilterLength(ids: string[]) {
  // Match postgrest-js's quoting of values containing reserved list characters.
  const values = ids.map((id) => /[,()]/.test(id) ? `"${id}"` : id).join(",");
  return new URLSearchParams({ google_review_id: `in.(${values})` }).toString().length;
}

export function batchGoogleReviewIds(ids: readonly string[], maxFilterLength = GOOGLE_REVIEW_ID_FILTER_MAX_LENGTH) {
  const batches: string[][] = [];
  let batch: string[] = [];

  for (const id of new Set(ids)) {
    if (!id) continue;
    if (encodedFilterLength([...batch, id]) > maxFilterLength) {
      if (batch.length === 0) throw new RangeError("Google review ID exceeds safe filter length");
      batches.push(batch);
      batch = [id];
      if (encodedFilterLength(batch) > maxFilterLength) {
        throw new RangeError("Google review ID exceeds safe filter length");
      }
    } else {
      batch.push(id);
    }
  }

  if (batch.length > 0) batches.push(batch);
  return batches;
}

export async function collectBatchedGoogleReviews<T extends { id: string }>(
  ids: readonly string[],
  loadBatch: (batch: string[]) => Promise<T[]>,
) {
  const rows: T[] = [];
  const seen = new Set<string>();
  for (const batch of batchGoogleReviewIds(ids)) {
    for (const row of await loadBatch(batch)) {
      if (seen.has(row.id)) continue;
      seen.add(row.id);
      rows.push(row);
    }
  }
  return rows;
}

export function removedGoogleReplyReviewIds(
  respondedReviews: readonly { id: string; google_review_id: string | null }[],
  googleReviewIdsWithOwnerReplies: ReadonlySet<string>,
) {
  return respondedReviews
    .filter((review) => review.google_review_id && !googleReviewIdsWithOwnerReplies.has(review.google_review_id))
    .map((review) => review.id);
}
