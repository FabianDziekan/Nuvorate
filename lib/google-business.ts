import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const scopes = ["https://www.googleapis.com/auth/business.manage", "openid", "email"];
export type GoogleLocation = { accountId: string; accountName: string; locationName: string; locationTitle: string; placeId: string | null };

export function googleConfigured() { return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_OAUTH_REDIRECT_URI && process.env.GOOGLE_TOKEN_ENCRYPTION_KEY); }
function key() { const value = process.env.GOOGLE_TOKEN_ENCRYPTION_KEY; if (!value) throw new Error("Google integration is not configured"); return createHash("sha256").update(value).digest(); }
export function encryptGoogleToken(value: string) { const iv = randomBytes(12); const cipher = createCipheriv("aes-256-gcm", key(), iv); const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]); return `${iv.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}.${encrypted.toString("base64url")}`; }
export function decryptGoogleToken(value: string) { const [iv, tag, encrypted] = value.split("."); if (!iv || !tag || !encrypted) throw new Error("Invalid encrypted Google token"); const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64url")); decipher.setAuthTag(Buffer.from(tag, "base64url")); return Buffer.concat([decipher.update(Buffer.from(encrypted, "base64url")), decipher.final()]).toString("utf8"); }
export function oauthState() { return randomBytes(32).toString("base64url"); }
export function pkceVerifier() { return randomBytes(48).toString("base64url"); }
export function pkceChallenge(verifier: string) { return createHash("sha256").update(verifier).digest("base64url"); }
export function isValidState(expected: string | undefined, received: string | null) { return Boolean(expected && received && expected.length >= 32 && expected === received); }
export function googleAuthUrl(state: string, verifier: string) { const url = new URL("https://accounts.google.com/o/oauth2/v2/auth"); url.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID!); url.searchParams.set("redirect_uri", process.env.GOOGLE_OAUTH_REDIRECT_URI!); url.searchParams.set("response_type", "code"); url.searchParams.set("scope", scopes.join(" ")); url.searchParams.set("access_type", "offline"); url.searchParams.set("prompt", "consent"); url.searchParams.set("state", state); url.searchParams.set("code_challenge", pkceChallenge(verifier)); url.searchParams.set("code_challenge_method", "S256"); return url.toString(); }
export async function googleLocations(accessToken: string): Promise<{ email: string; locations: GoogleLocation[] }> { const headers = { Authorization: `Bearer ${accessToken}` }; const accountsResponse = await fetch("https://mybusinessaccountmanagement.googleapis.com/v1/accounts", { headers, cache: "no-store" }); if (!accountsResponse.ok) { console.error("Accounts API:", await accountsResponse.text()); throw new Error("accounts"); } const accounts = (await accountsResponse.json()).accounts ?? []; const results: GoogleLocation[] = []; for (const account of accounts) { const response = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations?readMask=name,title,metadata.placeId&pageSize=100`, { headers, cache: "no-store" }); if (!response.ok) { console.error("Locations API:", account.name, response.status, await response.text()); continue; } const data = await response.json(); for (const location of data.locations ?? []) results.push({ accountId: account.name, accountName: account.accountName ?? account.name, locationName: location.name, locationTitle: location.title ?? "Lokalizacja Google", placeId: location.metadata?.placeId ?? null }); }
 const user = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers, cache: "no-store" }); const profile = user.ok ? await user.json() : {}; return { email: profile.email ?? "", locations: results }; }

export async function fetchGoogleLocationPlaceId(accessToken: string, locationId: string) {
  if (!/^locations\/[^/]+$/.test(locationId)) throw new Error("Invalid Google location resource.");

  const url = new URL(`https://mybusinessbusinessinformation.googleapis.com/v1/${locationId}`);
  url.searchParams.set("readMask", "name,title,metadata.placeId");
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!response.ok) throw new Error(`Google location request failed (${response.status}).`);
  const location = (await response.json()) as { metadata?: { placeId?: string } };
  return location.metadata?.placeId ?? null;
}
