const googleTranslationMarker = /\s+\(Translated by Google\)\s+/g;

/**
 * Google Business Profile v4 exposes one `comment` field. Some stored comments
 * contain Google's UI-style original-plus-translation presentation in that
 * single field. Strip the translated suffix only when the exact marker appears
 * once and both versions are present; ambiguous input remains untouched.
 */
export function normalizeGoogleReviewContent(value: string): string;
export function normalizeGoogleReviewContent(value: null | undefined): null;
export function normalizeGoogleReviewContent(value: string | null): string | null;
export function normalizeGoogleReviewContent(value: string | null | undefined): string | null {
  if (typeof value !== "string") {
    return value ?? null;
  }

  const markers = Array.from(value.matchAll(googleTranslationMarker));

  if (markers.length !== 1) {
    return value;
  }

  const marker = markers[0];
  const markerIndex = marker.index;

  if (typeof markerIndex !== "number") {
    return value;
  }

  const originalText = value.slice(0, markerIndex).trim();
  const translatedText = value
    .slice(markerIndex + marker[0].length)
    .trim();

  return originalText && translatedText ? originalText : value;
}
