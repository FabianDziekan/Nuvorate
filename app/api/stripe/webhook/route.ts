import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  constructStripeEvent,
  getConfiguredStripeMode,
  getPlanFromPriceId,
  retrieveStripeSubscriptionOrNull,
  type StripeCheckoutSession,
  type StripeEvent,
  type StripeInvoice,
  type StripeSubscription,
} from "@/lib/stripe";
import { planForStripeSubscriptionStatus } from "@/lib/stripe-subscription-policy";

type WebhookClaim = "claimed" | "processed" | "processing" | "missing";

function stripeId(value: string | { id: string } | null | undefined) {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

function subscriptionPriceId(subscription: StripeSubscription) {
  return subscription.items.data[0]?.price.id ?? null;
}

function subscriptionPeriodEnd(subscription: StripeSubscription) {
  const item = subscription.items.data[0];
  const periodEnd = item?.current_period_end ?? subscription.current_period_end;

  return periodEnd ? new Date(periodEnd * 1000).toISOString() : null;
}

function invoiceSubscriptionId(invoice: StripeInvoice) {
  return stripeId(
    invoice.subscription ?? invoice.parent?.subscription_details?.subscription ?? null,
  );
}

function eventCreatedAt(event: StripeEvent) {
  if (!event.id || !Number.isFinite(event.created)) {
    throw new Error("Webhook Stripe nie zawiera poprawnego identyfikatora lub czasu zdarzenia.");
  }

  return new Date(event.created * 1000).toISOString();
}

async function claimWebhookEvent(event: StripeEvent): Promise<WebhookClaim> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("claim_stripe_webhook_event", {
    p_event_type: event.type,
    p_stripe_created_at: eventCreatedAt(event),
    p_stripe_event_id: event.id,
  });

  if (error || typeof data !== "string") {
    throw new Error(`Nie udało się zarezerwować webhooka Stripe: ${error?.message ?? "brak odpowiedzi"}.`);
  }

  return data as WebhookClaim;
}

async function markWebhookEventProcessed(eventId: string) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("stripe_webhook_events")
    .update({
      last_error: null,
      processed_at: new Date().toISOString(),
      processing_started_at: null,
    })
    .eq("stripe_event_id", eventId)
    .is("processed_at", null);

  if (error) {
    throw new Error(`Nie udało się zakończyć obsługi webhooka Stripe: ${error.message}`);
  }
}

async function releaseWebhookEvent(eventId: string, error: unknown) {
  const message = error instanceof Error ? error.message : "Nieznany błąd webhooka Stripe.";
  const admin = createAdminClient();

  await admin
    .from("stripe_webhook_events")
    .update({
      last_error: message.slice(0, 1000),
      processing_started_at: null,
    })
    .eq("stripe_event_id", eventId)
    .is("processed_at", null);
}

async function syncSubscriptionToProfile({
  event,
  revokeIfCurrent = false,
  subscription,
  userId,
}: {
  event: StripeEvent;
  revokeIfCurrent?: boolean;
  subscription: StripeSubscription;
  userId?: string | null;
}) {
  const customerId = stripeId(subscription.customer);

  if (!customerId) {
    throw new Error("Subskrypcja Stripe nie zawiera customer id.");
  }

  const plan = revokeIfCurrent
    ? "unpaid"
    : planForStripeSubscriptionStatus(
        subscription.status,
        getPlanFromPriceId(subscriptionPriceId(subscription) ?? undefined),
      );
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("sync_stripe_subscription_state", {
    p_cancel_at_period_end: revokeIfCurrent
      ? false
      : Boolean(subscription.cancel_at_period_end),
    p_current_period_end: subscriptionPeriodEnd(subscription),
    p_customer_id: customerId,
    p_event_created_at: eventCreatedAt(event),
    p_event_id: event.id,
    p_plan: plan,
    p_price_id: subscriptionPriceId(subscription),
    p_revoke_if_current: revokeIfCurrent,
    p_subscription_id: subscription.id,
    p_subscription_status: subscription.status,
    p_user_id: userId ?? subscription.metadata?.user_id ?? null,
  });

  if (error || typeof data !== "string") {
    throw new Error(`Nie udało się zsynchronizować subskrypcji Stripe: ${error?.message ?? "brak odpowiedzi"}.`);
  }

  if (data === "missing_profile") {
    throw new Error("Nie znaleziono profilu dla subskrypcji Stripe.");
  }

  return data;
}

async function syncCurrentSubscription(
  event: StripeEvent,
  subscriptionId: string | null,
  userId?: string | null,
) {
  if (!subscriptionId) return "ignored_missing_subscription";

  const subscription = await retrieveStripeSubscriptionOrNull(subscriptionId);

  // A delayed created/updated/invoice event may point to an already-deleted
  // subscription. The dedicated deleted event is the only event allowed to revoke it.
  if (!subscription) return "ignored_missing_subscription";

  return syncSubscriptionToProfile({ event, subscription, userId });
}

async function handleCheckoutCompleted(event: StripeEvent, session: StripeCheckoutSession) {
  const userId = session.metadata?.user_id ?? session.client_reference_id ?? null;
  return syncCurrentSubscription(event, stripeId(session.subscription), userId);
}

async function handleSubscriptionChanged(event: StripeEvent, subscription: StripeSubscription) {
  return syncCurrentSubscription(event, subscription.id, subscription.metadata?.user_id);
}

async function handleSubscriptionDeleted(event: StripeEvent, subscription: StripeSubscription) {
  return syncSubscriptionToProfile({
    event,
    revokeIfCurrent: true,
    subscription: {
      ...subscription,
      cancel_at_period_end: false,
      status: subscription.status || "canceled",
    },
    userId: subscription.metadata?.user_id,
  });
}

async function handleInvoice(event: StripeEvent, invoice: StripeInvoice) {
  return syncCurrentSubscription(event, invoiceSubscriptionId(invoice));
}

async function processStripeEvent(event: StripeEvent) {
  if (event.type === "checkout.session.completed") {
    return handleCheckoutCompleted(event, event.data.object as StripeCheckoutSession);
  }

  if (event.type === "checkout.session.expired") {
    // An abandoned Checkout Session must never deactivate an already active plan.
    return "ignored_expired_checkout";
  }

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated"
  ) {
    return handleSubscriptionChanged(event, event.data.object as StripeSubscription);
  }

  if (event.type === "customer.subscription.deleted") {
    return handleSubscriptionDeleted(event, event.data.object as StripeSubscription);
  }

  if (
    event.type === "invoice.payment_succeeded" ||
    event.type === "invoice.paid" ||
    event.type === "invoice.payment_failed"
  ) {
    // For both successful and failed invoices, Stripe's current Subscription is
    // read first. A failed invoice alone is never treated as a terminal state.
    return handleInvoice(event, event.data.object as StripeInvoice);
  }

  return "ignored_event_type";
}

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Brak podpisu Stripe." }, { status: 400 });
  }

  let event: StripeEvent;

  try {
    event = constructStripeEvent(payload, signature);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nieprawidłowy webhook Stripe.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const configuredMode = getConfiguredStripeMode();
  if (
    configuredMode !== "unknown" &&
    typeof event.livemode === "boolean" &&
    event.livemode !== (configuredMode === "live")
  ) {
    return NextResponse.json(
      { error: "Webhook Stripe pochodzi z innego trybu niż skonfigurowany klucz API." },
      { status: 400 },
    );
  }

  try {
    const claim = await claimWebhookEvent(event);

    if (claim === "processed") {
      return NextResponse.json({ received: true, duplicate: true });
    }

    if (claim !== "claimed") {
      return NextResponse.json(
        { error: "Webhook Stripe jest już przetwarzany." },
        { status: 503 },
      );
    }

    await processStripeEvent(event);
    await markWebhookEventProcessed(event.id);

    return NextResponse.json({ received: true });
  } catch (error) {
    await releaseWebhookEvent(event.id, error);

    const message = error instanceof Error ? error.message : "Nie udało się obsłużyć webhooka Stripe.";
    console.error("Stripe webhook handling failed", { eventId: event.id, eventType: event.type, message });

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
