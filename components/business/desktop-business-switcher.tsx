import { getUserBusinessMemberships } from "@/lib/active-business";
import { getActiveBusinessBillingContext } from "@/lib/active-business-billing";
import { normalizePlan } from "@/lib/plans";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  DesktopBusinessSwitcherClient,
  type SwitcherBusiness,
} from "./desktop-business-switcher-client";

type ActiveBusiness = {
  id: string;
  name?: string | null;
  industry?: string | null;
  city?: string | null;
};

type DesktopBusinessSwitcherProps = {
  userId: string;
  activeBusiness: ActiveBusiness;
  plan: string;
};

function includedLocationCount(plan: unknown) {
  return normalizePlan(plan) === "business" ? 3 : 1;
}

/**
 * Memberships are the source of the switcher list. The active business is
 * resolved by the page through Active Business Context and is never inferred
 * from a client-provided value.
 */
export async function DesktopBusinessSwitcher({
  userId,
  activeBusiness,
  plan,
}: DesktopBusinessSwitcherProps) {
  const supabase = await createClient();
  let businesses: SwitcherBusiness[] = [];
  let ownerLocationCount = 0;
  let allowedLocationCount = 0;
  let isBillingOwner = false;
  let activeLocationPlan = plan;

  try {
    const memberships = await getUserBusinessMemberships(supabase, userId);
    const businessIds = memberships.map((membership) => membership.business_id);

    if (businessIds.length > 0) {
      const { data } = await supabase
        .from("businesses")
        .select("id, name, industry, city")
        .in("id", businessIds);

      const byId = new Map(
        ((data ?? []) as SwitcherBusiness[]).map((business) => [
          business.id,
          business,
        ]),
      );

      // Preserve the membership order and never include a business that did
      // not originate from the caller's memberships.
      businesses = businessIds
        .map((businessId) => byId.get(businessId))
        .filter((business): business is SwitcherBusiness => Boolean(business));
    }
  } catch {
    // The enclosing page already resolved an authorized active business. If
    // the optional list cannot be read, keep the sidebar usable without a
    // misleading switch affordance.
    businesses = [];
  }

  try {
    const billingContext = await getActiveBusinessBillingContext(
      supabase,
      userId,
      "id, owner_id",
    );

    if (billingContext) {
      activeLocationPlan = billingContext.plan;
      isBillingOwner = billingContext.billingOwnerId === userId;
      allowedLocationCount =
        includedLocationCount(billingContext.plan) + billingContext.extraLocationCount;

      if (isBillingOwner) {
        const admin = createAdminClient();
        const { count, error: ownerLocationsError } = await admin
          .from("businesses")
          .select("id", { count: "exact", head: true })
          .eq("owner_id", billingContext.billingOwnerId);

        if (!ownerLocationsError) ownerLocationCount = count ?? 0;
      }
    }
  } catch {
    // The creation action remains protected by the RPC. If optional entitlement
    // display data cannot be read, hide the affordance rather than guessing.
    isBillingOwner = false;
  }

  const activeAsSwitcherBusiness: SwitcherBusiness = {
    id: activeBusiness.id,
    name: activeBusiness.name ?? null,
    industry: activeBusiness.industry ?? null,
    city: activeBusiness.city ?? null,
  };

  if (!businesses.some((business) => business.id === activeBusiness.id)) {
    businesses = [activeAsSwitcherBusiness];
  }

  return (
    <DesktopBusinessSwitcherClient
      activeBusiness={activeAsSwitcherBusiness}
      businesses={businesses}
      canCreateLocation={
        isBillingOwner && ownerLocationCount < allowedLocationCount
      }
      isBillingOwner={isBillingOwner}
      locationUsage={{
        current: ownerLocationCount,
        allowed: allowedLocationCount,
      }}
      plan={activeLocationPlan}
    />
  );
}
