import { NextResponse } from "next/server";
import { AUTHOR_PROFILES_ENABLED } from "@/lib/author-profiles-launch";
import { requireActiveBusinessBillingContext } from "@/lib/active-business-billing";
import { hasPlanCapability } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchGoogleLocationPlaceId } from "@/lib/google-business";
import { createGoogleAccessToken, fetchGoogleLocationReviews } from "@/lib/google-reviews";
import { allowAuthorRequest, finishAuthorRequest, requestAuthorProfiles } from "@/lib/google-author-profile-request";
import { normalizeAuthorText } from "@/lib/google-author-profile-matching";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store" } });

export async function GET() {
  if (!AUTHOR_PROFILES_ENABLED) return json({ error: "Not found" }, 404);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return json({ profiles: [] }, 401);
  let businessId: string;
  try {
    const context = await requireActiveBusinessBillingContext(supabase, user.id, "id", "read");
    if (!hasPlanCapability(context.plan, "authorVerification")) return json({ profiles: [] }, 403);
    businessId = context.activeBusiness.business.id as string;
  } catch { return json({ profiles: [] }, 403); }
  if (!allowAuthorRequest(businessId)) return json({ profiles: [] }, 429);
  try {
    const admin = createAdminClient();
    const { data: connection, error } = await admin.from("google_business_connections")
      .select("google_account_id, google_location_id, encrypted_refresh_token")
      .eq("business_id", businessId).eq("status", "connected").maybeSingle();
    const key = process.env.GOOGLE_PLACES_API_KEY?.trim();
    if (error || !key || !connection?.google_account_id || !connection.google_location_id || !connection.encrypted_refresh_token) return json({ profiles: [] });
    const { data: stored, error: storedError } = await supabase.from("reviews").select("id, google_review_id, author_name, rating, content, created_at")
      .eq("business_id", businessId).eq("source", "google");
    if (storedError) return json({ profiles: [] });
    const gbp = await fetchGoogleLocationReviews({ accountId: connection.google_account_id, locationId: connection.google_location_id, encryptedRefreshToken: connection.encrypted_refresh_token });
    const token = await createGoogleAccessToken(connection.encrypted_refresh_token);
    const placeId = await fetchGoogleLocationPlaceId(token, connection.google_location_id);
    if (!placeId) return json({ profiles: [] });
    const matched = await requestAuthorProfiles(placeId, key, gbp.reviews);
    const profiles = (stored ?? []).map(row => {
      const match = matched.find(m => m.googleReviewId === row.google_review_id && m.status === "UNIQUE_MATCH");
      const current = gbp.reviews.find(r => r.googleReviewId === row.google_review_id);
      const unchanged = current && normalizeAuthorText(current.author.displayName) === normalizeAuthorText(row.author_name) &&
        current.rating === Number(row.rating) && normalizeAuthorText(current.comment?.trim() || "Opinia bez treści.") === normalizeAuthorText(row.content) &&
        Date.parse(current.createdAt ?? "") === Date.parse(row.created_at);
      const uri = unchanged ? match?.authorProfileUri ?? null : null;
      return { reviewId: row.id, authorProfileUri: uri, googleMapsUri: uri ? match?.googleMapsUri ?? null : null };
    });
    return json({ businessId, profiles });
  } catch { return json({ profiles: [] }); }
  finally { finishAuthorRequest(businessId); }
}
