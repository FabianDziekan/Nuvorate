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
import { createNotification } from "@/lib/notifications";
import {
  currentPeriodMonth,
  getAiLimit,
  getAiLimitMessage,
  normalizePlan,
  type AiUsageKind,
  type AppPlan,
} from "@/lib/plans";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const responseToneLabels: Record<string, string> = {
  friendly: "przyjazny",
  premium: "premium / elegancki",
  professional: "profesjonalny",
  short: "krótki",
};

async function getCurrentAiUsage(userId: string) {
  const supabaseAdmin = createAdminClient();
  const periodMonth = currentPeriodMonth();
  const { data, error } = await supabaseAdmin
    .from("ai_usage")
    .select("ai_replies_used, ai_analyses_used")
    .eq("user_id", userId)
    .eq("period_month", periodMonth)
    .maybeSingle();

  if (error) {
    throw new Error("Nie udało się odczytać limitów AI.");
  }

  return {
    periodMonth,
    repliesUsed: Number(data?.ai_replies_used ?? 0),
    analysesUsed: Number(data?.ai_analyses_used ?? 0),
  };
}

async function checkAiLimit({
  userId,
  plan,
  usageKind,
}: {
  userId: string;
  plan: AppPlan;
  usageKind: AiUsageKind;
}): Promise<
  | {
      ok: true;
      usage: Awaited<ReturnType<typeof getCurrentAiUsage>>;
    }
  | {
      ok: false;
      error: string;
    }
> {
  let usage: Awaited<ReturnType<typeof getCurrentAiUsage>>;

  try {
    usage = await getCurrentAiUsage(userId);
  } catch (error) {
    console.error("AI usage limit check failed", error);
    return {
      ok: false,
      error: "Nie udało się wygenerować odpowiedzi. Spróbuj ponownie.",
    };
  }

  const limit = getAiLimit(plan, usageKind);
  const used =
    usageKind === "reply" ? usage.repliesUsed : usage.analysesUsed;
  const allLimitsReached =
    usage.repliesUsed >= getAiLimit(plan, "reply") &&
    usage.analysesUsed >= getAiLimit(plan, "analysis");

  if (used >= limit) {
    return {
      ok: false,
      error: getAiLimitMessage(plan, usageKind, allLimitsReached),
    };
  }

  return {
    ok: true,
    usage,
  };
}

async function incrementAiUsage({
  userId,
  usageKind,
  periodMonth,
}: {
  userId: string;
  usageKind: AiUsageKind;
  periodMonth: string;
}) {
  const supabaseAdmin = createAdminClient();
  const usage = await getCurrentAiUsage(userId);
  const nextReplies =
    usageKind === "reply" ? usage.repliesUsed + 1 : usage.repliesUsed;
  const nextAnalyses =
    usageKind === "analysis" ? usage.analysesUsed + 1 : usage.analysesUsed;
  const { error } = await supabaseAdmin.from("ai_usage").upsert(
    {
      user_id: userId,
      period_month: periodMonth,
      ai_replies_used: nextReplies,
      ai_analyses_used: nextAnalyses,
    },
    { onConflict: "user_id,period_month" },
  );

  if (error) {
    throw new Error("Nie udało się zaktualizować licznika AI.");
  }
}

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

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("plan")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    console.error("AI review response profile lookup failed", profileError);
    return {
      ok: false,
      error: "Nie udało się wygenerować odpowiedzi. Spróbuj ponownie.",
    };
  }

  const plan = normalizePlan(profile.plan);
  const limitCheck = await checkAiLimit({
    userId: user.id,
    plan,
    usageKind: "reply",
  });

  if (!limitCheck.ok) {
    return {
      ok: false,
      error: limitCheck.error,
    };
  }

  try {
    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .select("id, name")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (businessError || !business) {
      throw new Error("Nie udało się odczytać firmy.");
    }

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

    await incrementAiUsage({
      userId: user.id,
      usageKind: "reply",
      periodMonth: limitCheck.usage.periodMonth,
    });

    await createNotification({
      businessId: business.id,
      type: "response_generated",
      title: "Odpowiedź gotowa",
      message: "Wygenerowano odpowiedź na opinię klienta.",
    });

    revalidatePath("/dashboard");
    revalidatePath("/responses");
    revalidatePath("/notifications");

    return {
      ok: true,
      responseText,
    };
  } catch (error) {
    console.error("AI review response generation failed", error);
    return {
      ok: false,
      error: "Nie udało się wygenerować odpowiedzi. Spróbuj ponownie.",
    };
  }
}
