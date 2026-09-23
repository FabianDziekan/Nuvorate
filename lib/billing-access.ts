import { isPaidPlan } from "./plans.ts";
import { isEntitledStripeStatus } from "./stripe-subscription-policy.ts";

export function hasPaidAccess(plan: unknown, subscriptionStatus: string | null | undefined) {
  return isPaidPlan(plan) && isEntitledStripeStatus(subscriptionStatus);
}
