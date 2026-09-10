import "server-only";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { GenerateReviewResponseState } from "@/components/dashboard/review-response-state";
import { openAIModel } from "@/lib/openai";
import { generateReviewResponseText, normalizeResponseTone } from "@/lib/review-response-generation";
import {
  hasPlanCapability,
} from "@/lib/plans";
import {
  completeAiUsageReservation,
  releaseAiUsageReservation,
  reserveAiUsage,
} from "@/lib/ai-usage";
import { createClient } from "@/lib/supabase/server";
import { requireActiveBusinessBillingContext } from "@/lib/active-business-billing";

export async function generateReviewResponseForReview(
  _previousState: GenerateReviewResponseState,
  formData: FormData,
): Promise<GenerateReviewResponseState> {
  const reviewId = formData.get("reviewId");

  if (typeof reviewId !== "string" || !reviewId) {
    return {
      ok: false,
      error: "Nie wskazano opinii.",
    };
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  let billingContext;
  try {
    billingContext = await requireActiveBusinessBillingContext(
      supabase,
      user.id,
      "id, name",
      "manage",
    );
  } catch (error) {
    console.error("AI review response billing context lookup failed", error);
    return {
      ok: false,
      error: "Nie udało się wygenerować odpowiedzi. Spróbuj ponownie.",
    };
  }

  const plan = billingContext.plan;

  if (!hasPlanCapability(plan, "manualReviewResponses")) {
    return {
      ok: false,
      error: "Wybierz plan, aby generować odpowiedzi na opinie.",
    };
  }

  const reservation = await reserveAiUsage({
    plan,
    usageKind: "reply",
    userId: billingContext.billingOwnerId,
  });

  if (!reservation.ok) {
    return {
      ok: false,
      error: reservation.error,
    };
  }

  try {
    const business = billingContext.activeBusiness.business;


    const { data: review, error: reviewError } = await supabase
      .from("reviews")
      .select("id, author_name, rating, content")
      .eq("id", reviewId)
      .eq("business_id", business.id)
      .maybeSingle();

    if (reviewError || !review) {
      throw new Error("Nie znaleziono opinii przypisanej do tej firmy.");
    }

    const { data: responseSettings, error: responseSettingsError } = await supabase
      .from("business_response_settings")
      .select("response_tone")
      .eq("business_id", business.id)
      .maybeSingle();

    if (responseSettingsError) {
      console.warn("Response tone lookup skipped", responseSettingsError);
    }

    const responseText = await generateReviewResponseText({
      businessName: business.name,
      responseTone: normalizeResponseTone(responseSettings?.response_tone),
      review: {
        author_name: review.author_name,
        rating: Number(review.rating),
        content: review.content,
      },
    });

    const { error: saveError } = await supabase
      .from("ai_review_responses")
      .upsert(
        {
          business_id: business.id,
          review_id: review.id,
          response_text: responseText,
          model: openAIModel,
        },
        { onConflict: "review_id" },
      );

    if (saveError) {
      throw new Error("Nie udało się zapisać wygenerowanej odpowiedzi.");
    }

    const { error: reviewSyncError } = await supabase
      .from("reviews")
      .update({
        response_generated_at: new Date().toISOString(),
        response_status: "ready",
        response_text: responseText,
      })
      .eq("id", review.id)
      .eq("business_id", business.id);

    if (reviewSyncError) {
      console.warn("Review response fields sync skipped", reviewSyncError);
    }

    await completeAiUsageReservation(reservation.id, billingContext.billingOwnerId);

    revalidatePath("/dashboard");
    revalidatePath("/responses");

    return {
      ok: true,
      responseText,
    };
  } catch (error) {
    await releaseAiUsageReservation(reservation.id, billingContext.billingOwnerId);
    console.error("AI review response generation failed", error);
    return {
      ok: false,
      error: "Nie udało się wygenerować odpowiedzi. Spróbuj ponownie.",
    };
  }
}
