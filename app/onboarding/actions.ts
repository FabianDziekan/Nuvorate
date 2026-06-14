"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { OnboardingState } from "@/app/onboarding/state";
import { createClient } from "@/lib/supabase/server";

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

  const { data: existingBusiness, error: existingBusinessError } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (existingBusinessError) {
    return {
      error:
        "Nie udało się sprawdzić danych firmy. Upewnij się, że schemat bazy został uruchomiony.",
    };
  }

  if (existingBusiness) {
    redirect("/dashboard");
  }

  const { error: insertError } = await supabase.from("businesses").insert({
    owner_id: user.id,
    name,
    industry,
    city,
    google_review_url: googleReviewUrl,
    setup_status: "completed",
  });

  if (insertError) {
    if (insertError.code === "23505") {
      redirect("/dashboard");
    }

    return {
      error:
        "Nie udało się zapisać firmy. Sprawdź dane i spróbuj ponownie.",
    };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
