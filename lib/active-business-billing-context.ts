import type { ActiveBusiness, BusinessRole } from "./active-business.ts";
import { normalizePlan, type AppPlan } from "./plans.ts";

export type BillingProfile = {
  extra_location_count: number | null;
  plan: unknown;
  subscription_status: string | null;
};

export type ActiveBusinessBillingContext<TBusiness = Record<string, any>> = {
  activeBusiness: ActiveBusiness<TBusiness & { owner_id: string }>;
  billingOwnerId: string;
  extraLocationCount: number;
  membershipRole: BusinessRole;
  operatorUserId: string;
  plan: AppPlan;
  subscriptionStatus: string | null;
};

export function fieldsWithBillingOwner(fields: string) {
  return fields === "*" || /(^|,)\s*owner_id\s*(,|$)/.test(fields)
    ? fields
    : `${fields}, owner_id`;
}

export function billingContextFrom(
  activeBusiness: ActiveBusiness<Record<string, any>>,
  operatorUserId: string,
  profile: BillingProfile | null,
): ActiveBusinessBillingContext {
  const billingOwnerId = activeBusiness.business.owner_id;

  if (typeof billingOwnerId !== "string" || !billingOwnerId) {
    throw new Error("Aktywna firma nie ma poprawnie wskazanego właściciela rozliczeń.");
  }

  if (!profile) {
    throw new Error("Nie udało się odczytać planu właściciela rozliczeń.");
  }

  return {
    activeBusiness: activeBusiness as ActiveBusiness<Record<string, any> & { owner_id: string }>,
    billingOwnerId,
    extraLocationCount: Math.max(0, Number(profile.extra_location_count) || 0),
    membershipRole: activeBusiness.membership.role,
    operatorUserId,
    plan: normalizePlan(profile.plan),
    subscriptionStatus: profile.subscription_status,
  };
}
