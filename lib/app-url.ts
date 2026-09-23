export const PRODUCTION_APP_URL = "https://www.nuvorate.pl";

export function resolveAppUrl({
  production,
  browserOrigin,
  configuredUrl,
}: {
  production: boolean;
  browserOrigin?: string;
  configuredUrl?: string;
}) {
  if (production) return PRODUCTION_APP_URL;
  return (browserOrigin || configuredUrl?.trim() || "http://localhost:3000").replace(
    /\/$/,
    "",
  );
}

export function getAppUrl() {
  return resolveAppUrl({
    production: process.env.NODE_ENV === "production",
    browserOrigin:
      typeof window === "undefined" ? undefined : window.location.origin,
    configuredUrl: process.env.NEXT_PUBLIC_APP_URL,
  });
}

export function canonicalRedirectUrl(requestUrl: string, production: boolean) {
  if (!production) return null;
  const url = new URL(requestUrl);
  // PKCE exchange must happen on the host holding the verifier cookie.
  if (url.pathname === "/auth/callback") return null;
  if (url.hostname !== "nuvorate.pl" && url.hostname !== "nuvorate.vercel.app") {
    return null;
  }
  return new URL(`${url.pathname}${url.search}`, PRODUCTION_APP_URL);
}
