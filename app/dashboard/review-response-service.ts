import "server-only";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { GenerateReviewResponseState } from "@/components/dashboard/review-response-state";
import {
  reviewResponseSchema,
  reviewResponseSystemPrompt,
} from "@/lib/ai-config";
import {
  generateStructuredOutput,
  openAIModel,
} from "@/lib/openai";
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

const responseToneLabels: Record<string, string> = {
  friendly: "przyjazny",
  premium: "premium / elegancki",
  professional: "profesjonalny",
  short: "krótki",
};

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

    const responseTone =
      typeof responseSettings?.response_tone === "string" &&
      responseSettings.response_tone in responseToneLabels
        ? responseSettings.response_tone
        : "professional";

    const result = await generateStructuredOutput<{ response: string }>({
      schemaName: "review_response",
      schema: reviewResponseSchema,
      system: reviewResponseSystemPrompt,
      user: JSON.stringify({
        business_name: business.name,
        preferred_response_style: responseToneLabels[responseTone],
        review: {
          author_name: review.author_name,
          rating: Number(review.rating),
          content: review.content,
        },
      }),
    });

    const responseText =
      typeof result.response === "string" ? result.response.trim() : "";

    if (!responseText) {
      throw new Error("OpenAI zwróciło pustą odpowiedź.");
    }

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
