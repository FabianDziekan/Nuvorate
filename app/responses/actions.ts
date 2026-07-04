"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { GenerateReviewResponseState } from "@/components/dashboard/review-response-state";
import { createClient } from "@/lib/supabase/server";
import { generateReviewResponseForReview } from "@/app/dashboard/review-response-service";

export type SaveResponseState = {
  error?: string;
  ok: boolean;
};

export async function generateResponseForResponsesPage(
  previousState: GenerateReviewResponseState,
  formData: FormData,
): Promise<GenerateReviewResponseState> {
  const result = await generateReviewResponseForReview(previousState, formData);
  const reviewId = formData.get("reviewId");

  if (
    result.ok &&
    typeof result.responseText === "string" &&
    typeof reviewId === "string"
  ) {
    const supabase = await createClient();
    const { error } = await supabase
      .from("reviews")
      .update({
        response_generated_at: new Date().toISOString(),
        response_status: "ready",
        response_text: result.responseText,
      })
      .eq("id", reviewId);

    if (error) {
      console.error("Review response sync failed", error);
      return {
        ok: false,
        error: "Odpowiedź została wygenerowana, ale nie udało się jej zapisać.",
      };
    }

    revalidatePath("/responses");
  }

  return result;
}

export async function saveReviewResponse(
  _previousState: SaveResponseState,
  formData: FormData,
): Promise<SaveResponseState> {
  const reviewId = formData.get("reviewId");
  const responseText = formData.get("responseText");
  const intent = formData.get("intent");

  if (typeof reviewId !== "string" || !reviewId) {
    return {
      ok: false,
      error: "Nie wskazano opinii.",
    };
  }

  if (typeof responseText !== "string" || !responseText.trim()) {
    return {
      ok: false,
      error: "Wpisz treść odpowiedzi przed zapisem.",
    };
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login?next=/responses");
  }

  const nextStatus = intent === "responded" ? "responded" : "ready";
  const { error } = await supabase
    .from("reviews")
    .update({
      response_status: nextStatus,
      response_text: responseText.trim(),
    })
    .eq("id", reviewId);

  if (error) {
    console.error("Review response save failed", error);
    return {
      ok: false,
      error: "Nie udało się zapisać odpowiedzi.",
    };
  }

  revalidatePath("/responses");
  revalidatePath("/dashboard");

  return {
    ok: true,
  };
}

export async function saveResponseSettings(formData: FormData) {
  const businessId = formData.get("businessId");

  if (typeof businessId !== "string" || !businessId) {
    throw new Error("Nie wskazano firmy.");
  }

  const enabledRatings = formData
    .getAll("enabledRatings")
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value >= 1 && value <= 5);
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login?next=/responses");
  }

  const { error } = await supabase.from("business_response_settings").upsert(
    {
      auto_generate: formData.get("autoGenerate") === "on",
      business_id: businessId,
      enabled_ratings: enabledRatings,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "business_id" },
  );

  if (error) {
    console.error("Response settings save failed", error);
    throw new Error("Nie udało się zapisać ustawień odpowiedzi.");
  }

  revalidatePath("/responses");
}
