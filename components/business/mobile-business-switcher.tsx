import { getUserBusinessMemberships } from "@/lib/active-business";
import { getActiveBusinessBillingContext } from "@/lib/active-business-billing";
import { createClient } from "@/lib/supabase/server";
import {
  MobileBusinessSwitcherClient,
  type MobileSwitcherBusiness,
} from "./mobile-business-switcher-client";

/**
 * The mobile affordance reads the same membership-backed Active Business
 * Context as the desktop switcher. It only renders when switching is useful.
 */
export async function MobileBusinessSwitcher({ userId }: { userId: string }) {
  const supabase = await createClient();

  try {
    const [billingContext, memberships] = await Promise.all([
      getActiveBusinessBillingContext(supabase, userId, "id, name, industry, city"),
      getUserBusinessMemberships(supabase, userId),
    ]);

    if (!billingContext || memberships.length < 2) return null;

    const businessIds = memberships.map((membership) => membership.business_id);
    const { data, error } = await supabase
      .from("businesses")
      .select("id, name, industry, city")
      .in("id", businessIds);

    if (error) return null;

    const byId = new Map(
      ((data ?? []) as MobileSwitcherBusiness[]).map((business) => [
        business.id,
        business,
      ]),
    );
    const businesses = businessIds
      .map((businessId) => byId.get(businessId))
      .filter((business): business is MobileSwitcherBusiness => Boolean(business));

    if (businesses.length < 2) return null;

    const activeBusiness = billingContext.activeBusiness.business;
    return (
      <MobileBusinessSwitcherClient
        activeBusiness={{
          id: activeBusiness.id,
          name: activeBusiness.name ?? null,
          industry: activeBusiness.industry ?? null,
          city: activeBusiness.city ?? null,
        }}
        businesses={businesses}
      />
    );
  } catch {
    return null;
  }
}
