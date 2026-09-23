"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createBusinessLocationAction } from "@/app/business-locations/actions";
import type { OnboardingState } from "@/app/onboarding/state";
import { createClient } from "@/lib/supabase/server";
import { getActiveBusinessForUser } from "@/lib/active-business";
import { getActiveBusinessBillingContext } from "@/lib/active-business-billing";
import { hasPaidAccess } from "@/lib/billing-access";
import { checkoutIntentQuery, parseCheckoutIntent } from "@/lib/checkout-intent";

export async function createBusiness(
  _previousState: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const name = String(formData.get("name") ?? "").trim();
  const industry = String(formData.get("industry") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const intent = parseCheckoutIntent(formData.get("plan"), formData.get("billing"));

  const fieldErrors: OnboardingState["fieldErrors"] = {};

  if (!name) {
    fieldErrors.name = "Podaj nazwę firmy.";
  }

  if (!industry) {
    fieldErrors.industry = "Wybierz branżę.";
  }

  if (!city) {
    fieldErrors.city = "Podaj miasto.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = userData.user;

  if (userError || !user) {
    redirect("/login?next=/onboarding");
  }
  const userId = user.id;

  const existingBusiness = (await getActiveBusinessForUser(supabase, userId, "id"))?.business;

  async function nextDestination() {
    const billing = await getActiveBusinessBillingContext(supabase, userId, "id");
    return billing && hasPaidAccess(billing.plan, billing.subscriptionStatus)
      ? "/dashboard" : intent ? `/checkout${checkoutIntentQuery(intent)}` : "/activate";
  }

  if (existingBusiness) {
    redirect(await nextDestination());
  }

  const result = await createBusinessLocationAction({
    name,
    industry,
    city,
    googleReviewUrl: null,
  });

  if (!result.success) {
    // A concurrent onboarding request may have created the first location
    // while this request was waiting for the database entitlement lock.
    const activeAfterAttempt = await getActiveBusinessForUser(
      supabase,
      userId,
      "id",
    );
    if (activeAfterAttempt) {
      redirect(await nextDestination());
    }

    return { error: result.error };
  }

  revalidatePath("/dashboard");
  redirect(await nextDestination());
}
