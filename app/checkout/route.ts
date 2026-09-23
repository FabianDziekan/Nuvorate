import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getActiveBusinessBillingContext } from "@/lib/active-business-billing";
import { hasPaidAccess } from "@/lib/billing-access";
import { checkoutIntentQuery } from "@/lib/checkout-intent";
import {
  createStripeCheckoutSession,
  createStripeCustomer,
  getAppUrl,
  hasPriceIdForPlan,
  isBillingCycle,
  isBillingPlan,
} from "@/lib/stripe";

function redirectWithError(path: string, message: string) {
  const appUrl = getAppUrl();
  const url = new URL(path, appUrl);
  url.searchParams.set("error", message);

  return privateRedirect(url);
}

function privateRedirect(url: URL | string) {
  const response = NextResponse.redirect(url);
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const selectedPlan = requestUrl.searchParams.get("plan");
  const selectedBillingCycle = requestUrl.searchParams.get("billing") ?? "monthly";
  const appUrl = getAppUrl();

  if (!isBillingPlan(selectedPlan)) {
    return redirectWithError("/activate", "Nieprawidłowy plan subskrypcji.");
  }

  if (!isBillingCycle(selectedBillingCycle)) {
    return redirectWithError("/activate", "Nieprawidłowy okres rozliczeniowy.");
  }

  if (!hasPriceIdForPlan(selectedPlan, selectedBillingCycle)) {
    return redirectWithError(
      "/",
      "Ten wariant rozliczenia nie jest jeszcze skonfigurowany.",
    );
  }

  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = userData.user;

  if (userError || !user) {
    return privateRedirect(new URL(`/register${checkoutIntentQuery({ plan: selectedPlan, billing: selectedBillingCycle })}`, appUrl));
  }

  const intentQuery = checkoutIntentQuery({ plan: selectedPlan, billing: selectedBillingCycle });
  const billingContext = await getActiveBusinessBillingContext(supabase, user.id, "id");
  if (!billingContext) return privateRedirect(new URL(`/onboarding${intentQuery}`, appUrl));
  if (hasPaidAccess(billingContext.plan, billingContext.subscriptionStatus)) {
    return privateRedirect(new URL("/dashboard", appUrl));
  }
  if (billingContext.billingOwnerId !== user.id) {
    return redirectWithError("/activate", "Tylko właściciel może aktywować subskrypcję.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("user_id, stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return redirectWithError("/activate", "Nie znaleziono profilu użytkownika.");
  }

  try {
    const admin = createAdminClient();
    let customerId = profile.stripe_customer_id as string | null;

    if (!customerId) {
      const customer = await createStripeCustomer({
        email: user.email ?? undefined,
        userId: user.id,
      });
      customerId = customer.id;

      const { error: updateError } = await admin
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("user_id", user.id);

      if (updateError) {
        throw new Error("Nie udało się zapisać klienta Stripe w profilu.");
      }
    }

    const session = await createStripeCheckoutSession({
      customerId,
      cycle: selectedBillingCycle,
      plan: selectedPlan,
      userId: user.id,
    });

    if (!session.url) {
      throw new Error("Stripe nie zwrócił adresu Checkout.");
    }

    return privateRedirect(session.url);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Nie udało się uruchomić płatności Stripe.";

    return redirectWithError(`/activate${intentQuery}`, message);
  }
}
