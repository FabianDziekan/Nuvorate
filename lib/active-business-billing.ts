import "server-only";

import {
  canManageBusiness,
  getActiveBusinessForUser,
} from "@/lib/active-business";
import {
  billingContextFrom,
  fieldsWithBillingOwner,
  type ActiveBusinessBillingContext,
  type BillingProfile,
} from "@/lib/active-business-billing-context";
import { createAdminClient } from "@/lib/supabase/admin";

type SupabaseLike = {
  from: (table: string) => any;
};

export type { ActiveBusinessBillingContext } from "@/lib/active-business-billing-context";

/**
 * Resolves billing only after Active Business Context has proven membership.
 * The billing-profile read deliberately uses server credentials: profile RLS
 * remains private and no browser client can query another user's subscription.
 */
export async function getActiveBusinessBillingContext<TBusiness = Record<string, any>>(
  supabase: SupabaseLike,
  operatorUserId: string,
  fields = "*",
): Promise<ActiveBusinessBillingContext<TBusiness> | null> {
  const activeBusiness = await getActiveBusinessForUser<Record<string, any>>(
    supabase,
    operatorUserId,
    fieldsWithBillingOwner(fields),
  );

  if (!activeBusiness) return null;

  const billingOwnerId = activeBusiness.business.owner_id;
  if (typeof billingOwnerId !== "string" || !billingOwnerId) {
    throw new Error("Aktywna firma nie ma poprawnie wskazanego właściciela rozliczeń.");
  }

  const admin = createAdminClient();
  const { data: profile, error } = await admin
    .from("profiles")
    .select("plan, subscription_status, extra_location_count")
    .eq("user_id", billingOwnerId)
    .maybeSingle();

  if (error) {
    throw new Error("Nie udało się odczytać planu właściciela rozliczeń.");
  }

  return billingContextFrom(activeBusiness, operatorUserId, profile as BillingProfile | null) as ActiveBusinessBillingContext<TBusiness>;
}

export async function requireActiveBusinessBillingContext<TBusiness = Record<string, any>>(
  supabase: SupabaseLike,
  operatorUserId: string,
  fields = "*",
  access: "read" | "manage" = "read",
): Promise<ActiveBusinessBillingContext<TBusiness>> {
  const context = await getActiveBusinessBillingContext<TBusiness>(
    supabase,
    operatorUserId,
    fields,
  );

  if (!context) throw new Error("Nie znaleziono aktywnej firmy.");
  if (access === "manage" && !canManageBusiness(context.membershipRole)) {
    throw new Error("Brak uprawnień do zarządzania aktywną firmą.");
  }

  return context;
}
