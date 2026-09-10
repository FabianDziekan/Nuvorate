import { getActiveBusinessForUser, getUserBusinessMemberships } from "./active-business.ts";
import { billingContextFrom, type BillingProfile } from "./active-business-billing-context.ts";
import { getDashboardNotifications } from "./dashboard-notifications-core.ts";

type Client = { from: (table: string) => any };
export type DashboardRequestContext = Awaited<ReturnType<typeof loadDashboardRequestContext>>;

/** Only called server-side with the ID verified by the enclosing page's auth checks. */
export async function loadDashboardRequestContext(
  supabase: Client,
  createAdmin: () => Client,
  userId: string,
) {
  const [memberships, profileResult] = await Promise.all([
    getUserBusinessMemberships(supabase, userId),
    supabase.from("profiles").select("first_name, active_business_id")
      .eq("user_id", userId).maybeSingle(),
  ]);
  if (profileResult.error && memberships.length > 0) {
    throw new Error("Nie udało się odczytać preferowanej firmy.");
  }
  const activeBusiness = await getActiveBusinessForUser(supabase, userId,
    "id, owner_id, name, industry, city, monthly_review_goal, google_review_url", {
      memberships,
      activeBusinessId: profileResult.data?.active_business_id ?? null,
    });
  if (!activeBusiness) {
    return { billingContext: null, profileResult, memberships, notifications: { latest: [], unreadCount: 0 }, accessibleBusinesses: [],
      businessListAvailable: false, ownerLocationCount: 0, ownerLocationCountAvailable: false };
  }
  const billingOwnerId = activeBusiness.business.owner_id;
  if (typeof billingOwnerId !== "string" || !billingOwnerId) {
    throw new Error("Aktywna firma nie ma poprawnie wskazanego właściciela rozliczeń.");
  }
  const admin = createAdmin();
  const businessIds = memberships.map((membership) => membership.business_id);
  // Optional switcher reads retain their existing graceful fallback behavior.
  const loadBusinesses = async () => {
    try {
      const { data, error } = await supabase.from("businesses")
        .select("id, name, industry, city").in("id", businessIds);
      const byId = new Map<string, any>((data ?? []).map((business: any) => [business.id, business]));
      return { businesses: businessIds.map((businessId) => byId.get(businessId)).filter(Boolean), available: !error };
    } catch {
      return { businesses: [], available: false };
    }
  };
  const loadOwnerCount = async () => {
    if (billingOwnerId !== userId) return { count: 0, available: true };
    try {
      const { count, error } = await admin.from("businesses")
        .select("id", { count: "exact", head: true }).eq("owner_id", billingOwnerId);
      return { count: error ? 0 : count ?? 0, available: true };
    } catch {
      return { count: 0, available: false };
    }
  };
  const [billingProfile, locations, ownerCount, notifications] = await Promise.all([
    admin.from("profiles").select("plan, subscription_status, extra_location_count")
      .eq("user_id", billingOwnerId).maybeSingle(),
    loadBusinesses(),
    loadOwnerCount(),
    getDashboardNotifications(supabase, activeBusiness.business.id),
  ]);
  if (billingProfile.error) throw new Error("Nie udało się odczytać planu właściciela rozliczeń.");
  return {
    billingContext: billingContextFrom(activeBusiness, userId, billingProfile.data as BillingProfile | null),
    profileResult,
    memberships,
    notifications,
    accessibleBusinesses: locations.businesses,
    businessListAvailable: locations.available,
    ownerLocationCount: ownerCount.count,
    ownerLocationCountAvailable: ownerCount.available,
  };
}
