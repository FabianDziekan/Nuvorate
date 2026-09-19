import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  encryptGoogleToken,
  GoogleBusinessApiError,
  googleConfigured,
  googleLocations,
  isValidState,
} from "@/lib/google-business";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requireActiveBusinessForUser } from "@/lib/active-business";

const businessManageScope = "https://www.googleapis.com/auth/business.manage";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const store = await cookies();
  const state = store.get("google_oauth_state")?.value;
  const verifier = store.get("google_oauth_verifier")?.value;
  const done = (target: string) => {
    const response = NextResponse.redirect(new URL(target, request.url));
    response.cookies.delete("google_oauth_state");
    response.cookies.delete("google_oauth_verifier");
    return response;
  };
  const fail = (stage: string, error: string) => {
    console.error(`[Google OAuth] failure_stage=${stage}`);
    return done(`/settings?google_error=${error}`);
  };

  if (!googleConfigured()) return fail("configuration", "oauth");
  if (!isValidState(state, url.searchParams.get("state"))) {
    return fail("session_expired", "session_expired");
  }

  const oauthError = url.searchParams.get("error");
  if (oauthError === "access_denied") return fail("cancelled", "cancelled");
  if (oauthError) return fail("authorization", "oauth");
  if (!verifier) return fail("session_expired", "session_expired");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return done("/login?next=/settings");

  let business;
  try {
    business = (await requireActiveBusinessForUser(supabase, user.id, "id", "manage")).business;
  } catch {
    return fail("business_access", "oauth");
  }

  const code = url.searchParams.get("code");
  if (!code) return fail("session_expired", "session_expired");

  let tokenResponse: Response;
  try {
    tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT_URI!,
        grant_type: "authorization_code",
        code_verifier: verifier,
      }),
    });
  } catch {
    return fail("token_exchange", "google_unavailable");
  }

  if (!tokenResponse.ok) {
    console.error(`[Google OAuth] token_exchange_failed status=${tokenResponse.status}`);
    return fail("token_exchange", tokenResponse.status === 400 ? "session_expired" : "google_unavailable");
  }

  let token: { access_token?: string; expires_in?: number; refresh_token?: string; scope?: string };
  try {
    token = await tokenResponse.json();
  } catch {
    return fail("token_exchange", "google_unavailable");
  }
  if (!token.refresh_token || !token.access_token) return fail("token_exchange", "oauth");

  const scopeWasReported = typeof token.scope === "string";
  const grantedScopes = (token.scope ?? "").split(/\s+/).filter(Boolean);
  const hasBusinessManage = grantedScopes.includes(businessManageScope);
  console.info(`[Google OAuth] business_manage_granted=${scopeWasReported ? hasBusinessManage : "unknown"}`);
  if (scopeWasReported && !hasBusinessManage) {
    return fail("missing_business_scope", "missing_business_scope");
  }

  let data;
  try {
    data = await googleLocations(token.access_token);
  } catch (error) {
    if (error instanceof GoogleBusinessApiError && error.stage === "accounts" && error.status === 403) {
      return fail("missing_business_scope", "missing_business_scope");
    }
    return fail("accounts_or_locations", "google_unavailable");
  }

  if (!data.locations.length) return fail("no_locations", "no_locations");

  const admin = createAdminClient();
  const refresh = encryptGoogleToken(token.refresh_token);
  const save = async (location: typeof data.locations[number]) =>
    admin.from("google_business_connections").upsert(
      {
        business_id: business.id,
        google_account_id: location.accountId,
        google_account_name: location.accountName,
        google_location_id: location.locationName,
        google_location_name: location.locationName,
        google_location_title: location.locationTitle,
        google_email: data.email,
        encrypted_refresh_token: refresh,
        access_token_expires_at: new Date(Date.now() + (token.expires_in ?? 3600) * 1000).toISOString(),
        status: "connected",
        last_error: null,
      },
      { onConflict: "business_id" },
    );

  if (data.locations.length === 1) {
    const { error } = await save(data.locations[0]);
    return error ? fail("save", "save") : done("/settings?google=connected");
  }

  const response = done("/settings?google=choose_location");
  response.cookies.set(
    "google_pending_connection",
    Buffer.from(JSON.stringify({ businessId: business.id, email: data.email, refresh, locations: data.locations })).toString("base64url"),
    { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 600 },
  );
  return response;
}
