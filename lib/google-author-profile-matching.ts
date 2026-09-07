import type { GoogleReviewPreview } from "./google-review-mapping.ts";

export type PlacesAuthorReview = { rating?: number; text?: { text?: string }; originalText?: { text?: string }; publishTime?: string; googleMapsUri?: string; authorAttribution?: { displayName?: string; uri?: string; photoUri?: string } };
export const normalizeAuthorText = (value: string | null | undefined) => (value ?? "").normalize("NFKC").replace(/\r\n/g, "\n").trim().replace(/\s+/gu, " ");
export function safeGoogleUri(value: unknown, kind: "profile" | "review" = "profile"): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password && !url.port &&
      ["google.com", "www.google.com"].includes(url.hostname) &&
      (kind === "profile" ? /^\/maps\/contrib\/\d+(?:\/reviews)?\/?$/.test(url.pathname) : url.pathname.startsWith("/maps/")) ? value : null;
  } catch { return null; }
}
function sameTime(a: string | null | undefined, b: string | null | undefined) {
  if (!a || !b) return false;
  const x = Date.parse(a), y = Date.parse(b);
  return Number.isFinite(x) && Number.isFinite(y) && x === y;
}
export function matchAuthorProfiles(gbp: GoogleReviewPreview[], places: PlacesAuthorReview[]) {
  const results = places.slice(0, 5).map(place => {
    const name = normalizeAuthorText(place.authorAttribution?.displayName);
    const text = normalizeAuthorText(place.originalText?.text ?? place.text?.text);
    const candidates = gbp.filter(review => Boolean(name && review.googleReviewId) && !review.author.isAnonymous &&
      typeof place.rating === "number" && place.rating >= 1 && place.rating <= 5 && review.rating === place.rating &&
      normalizeAuthorText(review.author.displayName) === name && normalizeAuthorText(review.comment) === text &&
      (sameTime(review.createdAt, place.publishTime) || sameTime(review.updatedAt, place.publishTime)));
    const status = candidates.length === 1 ? "UNIQUE_MATCH" : candidates.length > 1 ? "AMBIGUOUS" : "NO_MATCH";
    return { status, googleReviewId: candidates.length === 1 ? candidates[0].googleReviewId : null,
      authorProfileUri: status === "UNIQUE_MATCH" ? safeGoogleUri(place.authorAttribution?.uri) : null,
      googleMapsUri: status === "UNIQUE_MATCH" ? safeGoogleUri(place.googleMapsUri, "review") : null };
  });
  // The reverse association must also be unique: never select between Places records.
  return results.map(result => result.googleReviewId && results.filter(other => other.googleReviewId === result.googleReviewId).length > 1
    ? { ...result, status: "AMBIGUOUS", authorProfileUri: null, googleMapsUri: null } : result);
}
