import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createStripePortalSession, getAppUrl } from "@/lib/stripe";

function redirectWithError(path: string, message: string) {
  const appUrl = getAppUrl();
  const url = new URL(path, appUrl);
  url.searchParams.set("billing_error", message);

  return NextResponse.redirect(url);
}

export async function GET() {
  const appUrl = getAppUrl();
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = userData.user;

  if (userError || !user) {
    const loginUrl = new URL("/login", appUrl);
    loginUrl.searchParams.set("next", "/billing/portal");

    return NextResponse.redirect(loginUrl);
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return redirectWithError("/dashboard", "Nie znaleziono profilu użytkownika.");
  }

  if (!profile.stripe_customer_id) {
    return redirectWithError(
      "/dashboard",
      "Nie znaleziono aktywnej subskrypcji.",
    );
  }

  try {
    const session = await createStripePortalSession(profile.stripe_customer_id);

    if (!session.url) {
      throw new Error("Stripe nie zwrócił adresu portalu klienta.");
    }

    return NextResponse.redirect(session.url);
  } catch (error) {
    console.error("Stripe billing portal session failed", error);
    const message =
      error instanceof Error
        ? error.message
        : "Nie udało się otworzyć portalu Stripe.";

    return redirectWithError("/dashboard", message);
  }
}
