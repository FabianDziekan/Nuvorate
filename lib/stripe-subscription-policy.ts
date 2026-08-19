export type SubscriptionCachePlan = "starter" | "business" | "unpaid";

const entitledStatuses = new Set(["active", "trialing", "past_due"]);
const nonEntitledStatuses = new Set([
  "canceled",
  "unpaid",
  "incomplete",
  "incomplete_expired",
  "paused",
]);

export function planForStripeSubscriptionStatus(
  status: string,
  pricePlan: "starter" | "business" | null,
): SubscriptionCachePlan {
  if (entitledStatuses.has(status)) {
    if (!pricePlan) {
      throw new Error(
        "Subskrypcja z prawem dostępu nie zawiera rozpoznawalnego Price ID.",
      );
    }

    // past_due is an active Stripe lifecycle state, not a cancellation signal.
    // Stripe's later subscription event decides whether access is ultimately removed.
    return pricePlan;
  }

  if (nonEntitledStatuses.has(status)) {
    return "unpaid";
  }

  throw new Error(`Nieobsługiwany status subskrypcji Stripe: ${status}.`);
}
