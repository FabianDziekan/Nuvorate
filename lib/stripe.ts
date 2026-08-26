import "server-only";

import { createHmac, timingSafeEqual } from "crypto";

export type BillingPlan = "starter" | "business";
export type BillingCycle = "monthly" | "yearly";

export type StripeCustomer = {
  id: string;
};

export type StripeCheckoutSession = {
  id: string;
  url: string | null;
  client_reference_id?: string | null;
  customer: string | null;
  subscription: string | null;
  metadata?: Record<string, string>;
};

export type StripeSubscription = {
  id: string;
  cancel_at_period_end?: boolean;
  customer: string | { id: string } | null;
  status: string;
  metadata: Record<string, string>;
  current_period_end?: number;
  items: {
    data: Array<{
      current_period_end?: number;
      price: {
        id: string;
      };
    }>;
  };
};

export type StripeInvoice = {
  id: string;
  amount_paid?: number;
  currency?: string;
  customer: string | { id: string } | null;
  payment_intent?: string | { id: string } | null;
  status?: string | null;
  created?: number;
  subscription?: string | { id: string } | null;
  parent?: {
    subscription_details?: {
      subscription?: string | { id: string } | null;
    };
  };
};

export type StripeEvent = {
  created: number;
  id: string;
  livemode?: boolean;
  type: string;
  data: {
    object: unknown;
  };
};

export class StripeApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "StripeApiError";
    this.status = status;
  }
}

function requireEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Brak zmiennej środowiskowej ${name}.`);
  }

  return value;
}

function getStripeSecretKey() {
  return requireEnv("STRIPE_SECRET_KEY");
}

export function getConfiguredStripeMode() {
  const key = getStripeSecretKey();

  if (key.startsWith("sk_live_") || key.startsWith("rk_live_")) {
    return "live" as const;
  }

  if (key.startsWith("sk_test_") || key.startsWith("rk_test_")) {
    return "test" as const;
  }

  return "unknown" as const;
}

async function stripeRequest<T>({
  method = "POST",
  path,
  params,
}: {
  method?: "GET" | "POST";
  path: string;
  params?: URLSearchParams;
}) {
  const response = await fetch(`https://api.stripe.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${getStripeSecretKey()}`,
      ...(method === "POST"
        ? { "Content-Type": "application/x-www-form-urlencoded" }
        : {}),
    },
    body: method === "POST" ? params : undefined,
    cache: "no-store",
  });
  const payload = await response.json();

  if (!response.ok) {
    const message =
      typeof payload?.error?.message === "string"
        ? payload.error.message
        : "Stripe API zwróciło błąd.";

    throw new StripeApiError(message, response.status);
  }

  return payload as T;
}

export function getAppUrl() {
  return requireEnv("NEXT_PUBLIC_APP_URL").replace(/\/$/, "");
}

export function getWebhookSecret() {
  return requireEnv("STRIPE_WEBHOOK_SECRET");
}

export function isBillingPlan(plan: string | null): plan is BillingPlan {
  return plan === "starter" || plan === "business";
}

export function isBillingCycle(cycle: string | null): cycle is BillingCycle {
  return cycle === "monthly" || cycle === "yearly";
}

function getOptionalEnv(name: string) {
  return process.env[name]?.trim() || null;
}

export function getPriceIdForPlan(plan: BillingPlan, cycle: BillingCycle = "monthly") {
  if (plan === "starter") {
    return cycle === "yearly"
      ? requireEnv("STRIPE_STARTER_YEARLY_PRICE_ID")
      : requireEnv("STRIPE_STARTER_PRICE_ID");
  }

  return cycle === "yearly"
    ? requireEnv("STRIPE_BUSINESS_YEARLY_PRICE_ID")
    : requireEnv("STRIPE_BUSINESS_PRICE_ID");
}

export function hasPriceIdForPlan(plan: BillingPlan, cycle: BillingCycle = "monthly") {
  if (plan === "starter") {
    return Boolean(
      cycle === "yearly"
        ? getOptionalEnv("STRIPE_STARTER_YEARLY_PRICE_ID")
        : getOptionalEnv("STRIPE_STARTER_PRICE_ID"),
    );
  }

  return Boolean(
    cycle === "yearly"
      ? getOptionalEnv("STRIPE_BUSINESS_YEARLY_PRICE_ID")
      : getOptionalEnv("STRIPE_BUSINESS_PRICE_ID"),
  );
}

export function getPlanFromPriceId(priceId: string | undefined) {
  if (!priceId) {
    return null;
  }

  const starterPriceIds = [
    getOptionalEnv("STRIPE_STARTER_PRICE_ID"),
    getOptionalEnv("STRIPE_STARTER_YEARLY_PRICE_ID"),
  ];
  const businessPriceIds = [
    getOptionalEnv("STRIPE_BUSINESS_PRICE_ID"),
    getOptionalEnv("STRIPE_BUSINESS_YEARLY_PRICE_ID"),
  ];

  if (starterPriceIds.includes(priceId)) {
    return "starter" satisfies BillingPlan;
  }

  if (businessPriceIds.includes(priceId)) {
    return "business" satisfies BillingPlan;
  }

  return null;
}

export async function createStripeCustomer({
  email,
  userId,
}: {
  email?: string;
  userId: string;
}) {
  const params = new URLSearchParams();

  if (email) {
    params.set("email", email);
  }

  params.set("metadata[user_id]", userId);

  return stripeRequest<StripeCustomer>({
    path: "/customers",
    params,
  });
}

export async function createStripeCheckoutSession({
  customerId,
  cycle = "monthly",
  plan,
  userId,
}: {
  customerId: string;
  cycle?: BillingCycle;
  plan: BillingPlan;
  userId: string;
}) {
  const appUrl = getAppUrl();
  const params = new URLSearchParams();

  params.set("mode", "subscription");
  params.set("customer", customerId);
  params.set("client_reference_id", userId);
  params.set("line_items[0][price]", getPriceIdForPlan(plan, cycle));
  params.set("line_items[0][quantity]", "1");
  params.set("success_url", `${appUrl}/dashboard?checkout=success`);
  params.set("cancel_url", `${appUrl}/?checkout=cancel`);
  params.set("metadata[user_id]", userId);
  params.set("metadata[plan]", plan);
  params.set("metadata[billing_cycle]", cycle);
  params.set("subscription_data[metadata][user_id]", userId);
  params.set("subscription_data[metadata][plan]", plan);
  params.set("subscription_data[metadata][billing_cycle]", cycle);

  return stripeRequest<StripeCheckoutSession>({
    path: "/checkout/sessions",
    params,
  });
}

export async function createStripePortalSession(customerId: string) {
  const params = new URLSearchParams();

  params.set("customer", customerId);
  params.set("return_url", `${getAppUrl()}/dashboard`);

  return stripeRequest<{ url: string }>({
    path: "/billing_portal/sessions",
    params,
  });
}

export async function retrieveStripeSubscription(subscriptionId: string) {
  return stripeRequest<StripeSubscription>({
    method: "GET",
    path: `/subscriptions/${subscriptionId}`,
  });
}

export async function retrieveStripeSubscriptionOrNull(subscriptionId: string) {
  try {
    return await retrieveStripeSubscription(subscriptionId);
  } catch (error) {
    if (error instanceof StripeApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

export async function retrieveLatestStripeInvoice(customerId: string) {
  const payload = await stripeRequest<{ data?: StripeInvoice[] }>({
    method: "GET",
    path: `/invoices?customer=${encodeURIComponent(customerId)}&limit=1`,
  });

  return payload.data?.[0] ?? null;
}

export function constructStripeEvent(payload: string, signatureHeader: string) {
  const timestamp = signatureHeader
    .split(",")
    .find((part) => part.startsWith("t="))
    ?.slice(2);
  const signatures = signatureHeader
    .split(",")
    .filter((part) => part.startsWith("v1="))
    .map((part) => part.slice(3));

  if (!timestamp || signatures.length === 0) {
    throw new Error("Nieprawidłowy nagłówek podpisu Stripe.");
  }

  const signedPayload = `${timestamp}.${payload}`;
  const expectedSignature = createHmac("sha256", getWebhookSecret())
    .update(signedPayload, "utf8")
    .digest("hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");
  const verified = signatures.some((signature) => {
    const signatureBuffer = Buffer.from(signature, "hex");

    return (
      signatureBuffer.length === expectedBuffer.length &&
      timingSafeEqual(signatureBuffer, expectedBuffer)
    );
  });

  if (!verified) {
    throw new Error("Podpis webhooka Stripe jest nieprawidłowy.");
  }

  const timestampMs = Number(timestamp) * 1000;
  const toleranceMs = 5 * 60 * 1000;

  if (!Number.isFinite(timestampMs) || Math.abs(Date.now() - timestampMs) > toleranceMs) {
    throw new Error("Webhook Stripe jest poza dozwolonym oknem czasowym.");
  }

  return JSON.parse(payload) as StripeEvent;
}
