"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createBusinessLocationAction } from "@/app/business-locations/actions";
import type { OnboardingState } from "@/app/onboarding/state";
import { createClient } from "@/lib/supabase/server";
import { getActiveBusinessForUser } from "@/lib/active-business";

export async function createBusiness(
  _previousState: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const name = String(formData.get("name") ?? "").trim();
  const industry = String(formData.get("industry") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const googleReviewUrl = String(formData.get("googleReviewUrl") ?? "").trim();

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

  if (!googleReviewUrl) {
    fieldErrors.googleReviewUrl = "Podaj link do opinii Google.";
  } else {
    try {
      const url = new URL(googleReviewUrl);
      if (!["http:", "https:"].includes(url.protocol)) {
        fieldErrors.googleReviewUrl = "Link musi zaczynać się od http:// lub https://.";
      }
    } catch {
      fieldErrors.googleReviewUrl = "Podaj prawidłowy adres URL.";
    }
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

  const existingBusiness = (await getActiveBusinessForUser(supabase, user.id, "id"))?.business;

  if (existingBusiness) {
    redirect("/dashboard");
  }

  const result = await createBusinessLocationAction({
    name,
    industry,
    city,
    googleReviewUrl,
  });

  if (!result.success) {
    // A concurrent onboarding request may have created the first location
    // while this request was waiting for the database entitlement lock.
    const activeAfterAttempt = await getActiveBusinessForUser(
      supabase,
      user.id,
      "id",
    );
    if (activeAfterAttempt) {
      redirect("/dashboard");
    }

    return { error: result.error };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
