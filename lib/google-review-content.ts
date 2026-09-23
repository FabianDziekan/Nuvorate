const parenthesizedTranslation = /\([ \t]*translated[ \t]+by[ \t]+google[ \t]*\)/gi;
const parenthesizedOriginal = /\([ \t]*original[ \t]*\)/gi;
const bareTranslationLine = /^[ \t]*translated[ \t]+by[ \t]+google[ \t\r]*$/gim;
const bareOriginalLine = /^[ \t]*original[ \t\r]*$/gim;

type Marker = { index: number; length: number };

function markers(value: string, pattern: RegExp): Marker[] {
  return Array.from(value.matchAll(pattern), (match) => ({
    index: match.index,
    length: match[0].length,
  }));
}

function oneMarker(value: string, parenthesized: RegExp, bare: RegExp) {
  const found = [...markers(value, parenthesized), ...markers(value, bare)];
  return found.length === 1 ? found[0] : null;
}

function containsGoogleMarker(value: string) {
  return /\([ \t]*(?:translated[ \t]+by[ \t]+google|original)[ \t]*\)/i.test(value) ||
    /(?:^|\n)[ \t]*(?:translated[ \t]+by[ \t]+google|original)[ \t\r]*(?:\n|$)/i.test(value);
}

/**
 * Google Business Profile v4 exposes one `comment` field. Some stored comments
 * contain Google's UI-style original-plus-translation presentation in that
 * single field. Parenthesized markers can be inline; bare markers must occupy
 * their own lines. Ambiguous text is never truncated.
 */
export function normalizeGoogleReviewContent(value: string): string;
export function normalizeGoogleReviewContent(value: null | undefined): null;
export function normalizeGoogleReviewContent(value: string | null): string | null;
export function normalizeGoogleReviewContent(value: string | null | undefined): string | null {
  if (typeof value !== "string") {
    return value ?? null;
  }

  const translated = oneMarker(value, parenthesizedTranslation, bareTranslationLine);
  if (!translated) return value;

  const originals = [
    ...markers(value, parenthesizedOriginal),
    ...markers(value, bareOriginalLine),
  ];
  if (originals.length > 1) return value;

  if (originals.length === 1) {
    const original = originals[0];
    if (value.slice(0, translated.index).trim() || original.index <= translated.index + translated.length) return value;
    const translation = value.slice(translated.index + translated.length, original.index).trim();
    const authorText = value.slice(original.index + original.length).trim();
    return translation && authorText && !containsGoogleMarker(authorText) && !containsGoogleMarker(translation)
      ? authorText
      : value;
  }

  const authorText = value.slice(0, translated.index).trim();
  const translation = value.slice(translated.index + translated.length).trim();
  return authorText && translation && !containsGoogleMarker(authorText) && !containsGoogleMarker(translation)
    ? authorText
    : value;
}
