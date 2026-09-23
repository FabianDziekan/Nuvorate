export type CheckoutIntent = { plan: "starter" | "business"; billing: "monthly" | "yearly" };

export function parseCheckoutIntent(plan: unknown, billing: unknown): CheckoutIntent | null {
  if (plan !== "starter" && plan !== "business") return null;
  if (billing !== "monthly" && billing !== "yearly") return null;
  return { plan, billing };
}

export function checkoutIntentQuery(intent: CheckoutIntent | null) {
  return intent ? `?plan=${intent.plan}&billing=${intent.billing}` : "";
}
