import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
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

  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const selectedPlan = requestUrl.searchParams.get("plan");
  const selectedBillingCycle = requestUrl.searchParams.get("billing") ?? "monthly";
  const appUrl = getAppUrl();

  if (!isBillingPlan(selectedPlan)) {
    return redirectWithError("/dashboard", "Nieprawidłowy plan subskrypcji.");
  }

  if (!isBillingCycle(selectedBillingCycle)) {
    return redirectWithError("/dashboard", "Nieprawidłowy okres rozliczeniowy.");
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
    const loginUrl = new URL("/login", appUrl);
    loginUrl.searchParams.set(
      "next",
      `/checkout?plan=${encodeURIComponent(selectedPlan)}&billing=${encodeURIComponent(selectedBillingCycle)}`,
    );

    return NextResponse.redirect(loginUrl);
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("user_id, stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return redirectWithError("/dashboard", "Nie znaleziono profilu użytkownika.");
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

    return NextResponse.redirect(session.url);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Nie udało się uruchomić płatności Stripe.";

    return redirectWithError("/dashboard", message);
  }
}
