import { matchAuthorProfiles, type PlacesAuthorReview } from "./google-author-profile-matching.ts";
import type { GoogleReviewPreview } from "./google-review-mapping.ts";

export async function requestAuthorProfiles(placeId: string, key: string, reviews: GoogleReviewPreview[], request: typeof fetch = fetch) {
  if (!placeId || !key) return [];
  try {
    const response = await request(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
      headers: { "X-Goog-Api-Key": key, "X-Goog-FieldMask": "reviews.rating,reviews.text,reviews.originalText,reviews.publishTime,reviews.authorAttribution,reviews.googleMapsUri" },
      cache: "no-store", redirect: "error", signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return [];
    const payload = await response.json();
    if (!Array.isArray(payload?.reviews)) return [];
    return matchAuthorProfiles(reviews, payload.reviews.filter((r: unknown) => r && typeof r === "object") as PlacesAuthorReview[]);
  } catch { return []; }
}

// Only request metadata is retained. This is per-instance protection, not a distributed quota.
const attempts = new Map<string, number>();
const active = new Set<string>();
export function allowAuthorRequest(businessId: string, now = Date.now()) {
  for (const [id, time] of attempts) if (now - time >= 60000) attempts.delete(id);
  if (active.has(businessId) || attempts.has(businessId) || attempts.size >= 10000) return false;
  attempts.set(businessId, now);
  active.add(businessId);
  return true;
}
export function finishAuthorRequest(businessId: string) { active.delete(businessId); }
