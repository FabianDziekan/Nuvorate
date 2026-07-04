import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  constructStripeEvent,
  getPlanFromPriceId,
  isBillingPlan,
  retrieveStripeSubscription,
  type StripeCheckoutSession,
  type StripeInvoice,
  type StripeSubscription,
} from "@/lib/stripe";

type ProfileUpdate = Record<string, string | null>;

type ProfileUpdateResult = {
  profile: {
    user_id: string;
    plan: string | null;
    subscription_status: string | null;
  } | null;
  rowsUpdated: number;
  updated: boolean;
};

type ProfileUpdateLogContext = {
  event: string;
  plan?: string | null;
  userId?: string | null;
};

function stripeId(value: string | { id: string } | null | undefined) {
  if (!value) {
    return null;
  }

  return typeof value === "string" ? value : value.id;
}

function isActiveSubscriptionStatus(status: string) {
  return ["active", "trialing"].includes(status);
}

function isUnpaidSubscriptionStatus(status: string) {
  return ["canceled", "unpaid", "incomplete_expired"].includes(status);
}

function subscriptionPriceId(subscription: StripeSubscription) {
  return subscription.items.data[0]?.price.id;
}

function subscriptionPeriodEnd(subscription: StripeSubscription) {
  const item = subscription.items.data[0];
  const periodEnd =
    item?.current_period_end ?? subscription.current_period_end;

  return periodEnd ? new Date(periodEnd * 1000).toISOString() : null;
}

function invoiceSubscriptionId(invoice: StripeInvoice) {
  return stripeId(
    invoice.subscription ??
      invoice.parent?.subscription_details?.subscription ??
      null,
  );
}

async function retrieveSubscription(subscriptionId: string | null) {
  if (!subscriptionId) {
    return null;
  }

  return retrieveStripeSubscription(subscriptionId);
}

async function updateProfileBy(
  column: "user_id" | "stripe_customer_id" | "stripe_subscription_id",
  value: string,
  values: ProfileUpdate,
  context?: ProfileUpdateLogContext,
) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .update(values)
    .eq(column, value)
    .select("user_id, plan, subscription_status");

  const rowsUpdated = data?.length ?? 0;
  const selectedProfile = data?.[0] ?? null;
  const profileLookup = selectedProfile
    ? { data: selectedProfile, error: null }
    : await admin
        .from("profiles")
        .select("user_id, plan, subscription_status")
        .eq(column, value)
        .maybeSingle();

  console.log("EVENT:", context?.event ?? "brak");
  console.log("USER_ID:", context?.userId ?? profileLookup.data?.user_id ?? "brak");
  console.log("PLAN:", context?.plan ?? values.plan ?? profileLookup.data?.plan ?? "brak");
  console.log("ROWS UPDATED:", rowsUpdated);
  console.log("UPDATE ERROR:", error ?? "brak");
  if (error) {
    console.error("SUPABASE UPDATE ERROR:", error);
  }
  if (profileLookup.error) {
    console.error("SUPABASE SELECT PROFILE ERROR:", profileLookup.error);
  }
  console.log("SELECT PROFILE:", {
    plan: profileLookup.data?.plan ?? null,
    subscription_status: profileLookup.data?.subscription_status ?? null,
  });

  if (error) {
    throw new Error(`Supabase update failed: ${error.message}`);
  }

  return {
    profile: selectedProfile,
    rowsUpdated,
    updated: rowsUpdated > 0,
  } satisfies ProfileUpdateResult;
}

async function updateProfileByStripeCustomer(
  customerId: string,
  values: ProfileUpdate,
  context?: ProfileUpdateLogContext,
) {
  const result = await updateProfileBy(
    "stripe_customer_id",
    customerId,
    values,
    context,
  );

  if (result.updated) {
    return true;
  }

  throw new Error(
    `Nie znaleziono profilu dla stripe_customer_id=${customerId}.`,
  );
}

async function tryUpdateProfileByStripeCustomer(
  customerId: string,
  values: ProfileUpdate,
  context?: ProfileUpdateLogContext,
) {
  return (await updateProfileBy(
    "stripe_customer_id",
    customerId,
    values,
    context,
  )).updated;
}

async function updateProfileFromStripeIds({
  customerId,
  subscriptionId,
  userId,
  values,
  context,
}: {
  customerId: string | null;
  subscriptionId: string | null;
  userId?: string;
  values: ProfileUpdate;
  context: ProfileUpdateLogContext;
}) {
  if (userId) {
    const result = await updateProfileBy("user_id", userId, values, {
      ...context,
      userId,
    });

    if (result.updated) {
      return result;
    }

    throw new Error(`Nie znaleziono profilu dla metadata.user_id=${userId}.`);
  }

  if (
    subscriptionId
  ) {
    const result = await updateProfileBy(
      "stripe_subscription_id",
      subscriptionId,
      values,
      context,
    );

    if (result.updated) {
      return result;
    }
  }

  throw new Error(
    `Event Stripe bez metadata.user_id nie może bezpiecznie zmienić profilu. customer=${customerId ?? "brak"}, subscription=${subscriptionId ?? "brak"}.`,
  );
}

async function handleCheckoutCompleted(session: StripeCheckoutSession) {
  const eventName = "checkout.session.completed";
  const userId = session.metadata?.user_id;
  const metadataPlan = session.metadata?.plan ?? null;
  const customerId = stripeId(session.customer);
  const subscriptionId = stripeId(session.subscription);
  const subscription = await retrieveSubscription(subscriptionId);
  const planFromPrice = subscription
    ? getPlanFromPriceId(subscriptionPriceId(subscription))
    : null;
  const plan = isBillingPlan(metadataPlan) ? metadataPlan : planFromPrice;

  if (!userId || !plan || !customerId || !subscriptionId) {
    throw new Error("Checkout session nie zawiera wymaganych danych planu.");
  }

  const status = subscription?.status ?? "active";

  console.log("USER_ID:", userId ?? "brak");
  console.log("PLAN:", plan ?? "brak");
  console.log("CUSTOMER_ID:", customerId ?? "brak");
  console.log("SUBSCRIPTION_ID:", subscriptionId ?? "brak");

  const updateResult = await updateProfileFromStripeIds({
    customerId,
    subscriptionId,
    userId,
    context: {
      event: eventName,
      plan,
      userId,
    },
    values: {
      plan: isActiveSubscriptionStatus(status) ? plan : "starter",
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      subscription_status: status,
      current_period_end: subscription
        ? subscriptionPeriodEnd(subscription)
        : null,
    },
  });

  console.log("PROFILE UPDATED:", updateResult.updated);
  console.log("ROWS UPDATED:", updateResult.rowsUpdated);
}

async function handleSubscriptionChanged(
  subscription: StripeSubscription,
  eventName: string,
) {
  const customerId = stripeId(subscription.customer);
  const plan = getPlanFromPriceId(subscriptionPriceId(subscription));
  const userId = subscription.metadata.user_id;

  if (!customerId) {
    throw new Error("Subskrypcja Stripe nie zawiera customer id.");
  }

  const subscriptionValues = {
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    subscription_status: subscription.status,
    current_period_end: subscriptionPeriodEnd(subscription),
  };

  console.log("USER_ID:", userId || "brak");
  console.log("PLAN:", plan ?? "brak");
  console.log("CUSTOMER_ID:", customerId);
  console.log("SUBSCRIPTION_ID:", subscription.id);

  if (isUnpaidSubscriptionStatus(subscription.status)) {
    const updateResult = await updateProfileFromStripeIds({
      customerId,
      subscriptionId: subscription.id,
      userId,
      context: {
        event: eventName,
        plan: "unpaid",
        userId,
      },
      values: {
      ...subscriptionValues,
      plan: "unpaid",
      },
    });

    console.log("PROFILE UPDATED:", updateResult.updated);
    console.log("ROWS UPDATED:", updateResult.rowsUpdated);

    return;
  }

  if (!isActiveSubscriptionStatus(subscription.status)) {
    const updateResult = await updateProfileFromStripeIds({
      customerId,
      subscriptionId: subscription.id,
      userId,
      context: {
        event: eventName,
        plan,
        userId,
      },
      values: subscriptionValues,
    });

    console.log("PROFILE UPDATED:", updateResult.updated);
    console.log("ROWS UPDATED:", updateResult.rowsUpdated);

    return;
  }

  if (!plan) {
    throw new Error("Aktywna subskrypcja Stripe nie zawiera rozpoznawalnego planu.");
  }

  const updateResult = await updateProfileFromStripeIds({
    customerId,
    subscriptionId: subscription.id,
    userId,
    context: {
      event: eventName,
      plan,
      userId,
    },
    values: {
    ...subscriptionValues,
    plan,
    },
  });

  console.log("PROFILE UPDATED:", updateResult.updated);
  console.log("ROWS UPDATED:", updateResult.rowsUpdated);
}

async function handleSubscriptionDeleted(subscription: StripeSubscription) {
  const eventName = "customer.subscription.deleted";
  const customerId = stripeId(subscription.customer);

  if (!customerId) {
    throw new Error("Usunięta subskrypcja Stripe nie zawiera customer id.");
  }

  const updated = await tryUpdateProfileByStripeCustomer(customerId, {
    plan: "unpaid",
    stripe_subscription_id: subscription.id,
    subscription_status: subscription.status || "canceled",
    current_period_end: subscriptionPeriodEnd(subscription),
  }, {
    event: eventName,
    plan: "unpaid",
  });

  if (!updated) {
    console.warn(
      `Stripe subscription.deleted ignored: no profile for stripe_customer_id=${customerId}.`,
    );
  }
}

async function handleInvoicePaymentSucceeded(invoice: StripeInvoice) {
  const eventName = "invoice.payment_succeeded";
  const customerId = stripeId(invoice.customer);
  const subscriptionId = invoiceSubscriptionId(invoice);
  const subscription = await retrieveSubscription(subscriptionId);

  if (!subscription || !customerId) {
    return;
  }

  const plan = getPlanFromPriceId(subscriptionPriceId(subscription));

  if (!plan) {
    throw new Error("Opłacona subskrypcja nie zawiera rozpoznawalnego planu.");
  }

  console.log("USER_ID:", subscription.metadata.user_id || "brak");
  console.log("PLAN:", plan);
  console.log("CUSTOMER_ID:", customerId);
  console.log("SUBSCRIPTION_ID:", subscription.id);

  const updateResult = await updateProfileFromStripeIds({
    customerId,
    subscriptionId: subscription.id,
    userId: subscription.metadata.user_id,
    context: {
      event: eventName,
      plan,
      userId: subscription.metadata.user_id,
    },
    values: {
      plan: isActiveSubscriptionStatus(subscription.status) ? plan : "starter",
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      current_period_end: subscriptionPeriodEnd(subscription),
    },
  });

  console.log("PROFILE UPDATED:", updateResult.updated);
  console.log("ROWS UPDATED:", updateResult.rowsUpdated);
}

async function handleInvoicePaymentFailed(invoice: StripeInvoice) {
  const eventName = "invoice.payment_failed";
  const customerId = stripeId(invoice.customer);
  const subscriptionId = invoiceSubscriptionId(invoice);
  const subscription = await retrieveSubscription(subscriptionId);

  if (!customerId && !subscriptionId) {
    return;
  }

  await updateProfileFromStripeIds({
    customerId,
    subscriptionId,
    userId: subscription?.metadata.user_id,
    context: {
      event: eventName,
      plan: "unpaid",
      userId: subscription?.metadata.user_id,
    },
    values: {
      plan: "unpaid",
      subscription_status: "past_due",
    },
  });
}

async function handleCheckoutExpired(session: StripeCheckoutSession) {
  const eventName = "checkout.session.expired";
  const customerId = stripeId(session.customer);
  const subscriptionId = stripeId(session.subscription);

  if (!customerId && !subscriptionId) {
    return;
  }

  await updateProfileFromStripeIds({
    customerId,
    subscriptionId,
    userId: session.metadata?.user_id,
    context: {
      event: eventName,
      plan: "unpaid",
      userId: session.metadata?.user_id,
    },
    values: {
      plan: "unpaid",
      stripe_customer_id: customerId,
      subscription_status: "incomplete_expired",
    },
  });
}

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Brak podpisu Stripe." },
      { status: 400 },
    );
  }

  let event;

  try {
    event = constructStripeEvent(payload, signature);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Nieprawidłowy webhook Stripe.";

    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
  if (event.type === "checkout.session.completed") {
      console.log("EVENT:", event.type);
      await handleCheckoutCompleted(
        event.data.object as StripeCheckoutSession,
      );
    }

    if (event.type === "checkout.session.expired") {
      console.log("EVENT:", event.type);
      await handleCheckoutExpired(event.data.object as StripeCheckoutSession);
    }

    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated"
    ) {
      console.log("EVENT:", event.type);
      await handleSubscriptionChanged(
        event.data.object as StripeSubscription,
        event.type,
      );
    }

    if (event.type === "customer.subscription.deleted") {
      console.log("EVENT:", event.type);
      await handleSubscriptionDeleted(event.data.object as StripeSubscription);
    }

    if (event.type === "invoice.payment_succeeded") {
      console.log("EVENT:", event.type);
      await handleInvoicePaymentSucceeded(event.data.object as StripeInvoice);
    }

    if (event.type === "invoice.payment_failed") {
      console.log("EVENT:", event.type);
      await handleInvoicePaymentFailed(event.data.object as StripeInvoice);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Nie udało się obsłużyć webhooka Stripe.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
