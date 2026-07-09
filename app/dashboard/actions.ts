"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  businessAnalysisSchema,
  businessAnalysisSystemPrompt,
  reviewResponseSchema,
  reviewResponseSystemPrompt,
} from "@/lib/ai-config";
import type { GenerateReviewResponseState } from "@/components/dashboard/review-response-state";
import {
  generateStructuredOutput,
  openAIModel,
} from "@/lib/openai";
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

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function syncGoogleReviews(): Promise<{
  lastSyncedAt: string;
  message: string;
  newReviews: number;
  success: boolean;
}> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("id, google_review_url")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (businessError || !business) {
    return {
      lastSyncedAt: new Date().toISOString(),
      message: "Nie udało się odczytać danych firmy.",
      newReviews: 0,
      success: false,
    };
  }

  // Future integration point: fetch Google Business Profile reviews here,
  // upsert new reviews into public.reviews, then create notifications when newReviews > 0.
  revalidatePath("/dashboard");

  return {
    lastSyncedAt: new Date().toISOString(),
    message: "Brak nowych opinii",
    newReviews: 0,
    success: true,
  };
}

export async function updateMonthlyReviewGoal(goal: number): Promise<{
  error?: string;
  success: boolean;
}> {
  const nextGoal = Math.round(Number(goal));

  if (!Number.isFinite(nextGoal) || nextGoal < 1 || nextGoal > 1000) {
    return {
      error: "Podaj wartość od 1 do 1000.",
      success: false,
    };
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const { data: business, error: businessLookupError } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (businessLookupError || !business) {
    console.error("Monthly review goal business lookup failed", businessLookupError);
    return {
      error: "Nie udało się odczytać firmy.",
      success: false,
    };
  }

  const { error: updateError } = await supabase
    .from("businesses")
    .update({ monthly_review_goal: nextGoal })
    .eq("id", business.id);

  if (updateError) {
    console.error("Monthly review goal update failed", updateError);
    return {
      error: "Nie udało się zapisać celu.",
      success: false,
    };
  }

  revalidatePath("/dashboard");

  return {
    success: true,
  };
}

function aiErrorRedirect(path: string, message: string): never {
  redirect(`${path}?ai_error=${encodeURIComponent(message)}`);
}

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

async function enforceAiLimit({
  userId,
  plan,
  usageKind,
  redirectPath,
}: {
  userId: string;
  plan: AppPlan;
  usageKind: AiUsageKind;
  redirectPath: string;
}) {
  const limitCheck = await checkAiLimit({ userId, plan, usageKind });

  if (!limitCheck.ok) {
    aiErrorRedirect(redirectPath, limitCheck.error);
  }

  return limitCheck.usage;
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
      error:
        usageKind === "reply"
          ? "Nie udało się wygenerować odpowiedzi. Spróbuj ponownie."
          : "Nie udało się wygenerować analizy. Spróbuj ponownie.",
    };
  }

  const used =
    usageKind === "reply" ? usage.repliesUsed : usage.analysesUsed;
  const limit = getAiLimit(plan, usageKind);
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

export async function generateReviewResponse(
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

    const result = await generateStructuredOutput<{ response: string }>({
      schemaName: "review_response",
      schema: reviewResponseSchema,
      system: reviewResponseSystemPrompt,
      user: JSON.stringify({
        business_name: business.name,
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

    await incrementAiUsage({
      userId: user.id,
      usageKind: "reply",
      periodMonth: limitCheck.usage.periodMonth,
    });

    revalidatePath("/dashboard");

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

export async function generateBusinessAnalysis(formData?: FormData) {
  const redirectPath =
    typeof formData?.get("redirectTo") === "string"
      ? String(formData.get("redirectTo"))
      : "/dashboard";
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const [
    { data: business, error: businessError },
    { data: profile, error: profileError },
  ] = await Promise.all([
    supabase
      .from("businesses")
      .select("id, name, industry, city")
      .eq("owner_id", user.id)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("plan")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  if (businessError || profileError || !business || !profile) {
    throw new Error("Nie udało się odczytać firmy lub planu.");
  }

  const plan = normalizePlan(profile.plan);
  const usage = await enforceAiLimit({
    userId: user.id,
    plan,
    usageKind: "analysis",
    redirectPath,
  });

  const periodEnd = new Date();
  const periodStart = new Date(periodEnd);
  periodStart.setUTCDate(periodStart.getUTCDate() - 30);

  const { data: reviews, error: reviewsError } = await supabase
    .from("reviews")
    .select("author_name, rating, content, created_at")
    .eq("business_id", business.id)
    .gte("created_at", periodStart.toISOString())
    .lte("created_at", periodEnd.toISOString())
    .order("created_at", { ascending: false });

  if (reviewsError) {
    throw new Error("Nie udało się pobrać opinii do analizy.");
  }

  if (!reviews.length) {
    throw new Error("Brak opinii z ostatnich 30 dni do przeanalizowania.");
  }

  const result = await generateStructuredOutput<{
    score: number;
    trend: "up" | "down" | "stable";
    summary: string;
    praised_elements: string[];
    reported_problems: string[];
    recommendations: string[];
  }>({
    schemaName: "business_review_analysis",
    schema: businessAnalysisSchema,
    system: businessAnalysisSystemPrompt,
    user: JSON.stringify({
      business: {
        name: business.name,
        industry: business.industry,
        city: business.city,
      },
      period: {
        start: periodStart.toISOString(),
        end: periodEnd.toISOString(),
      },
      reviews: reviews.map((review) => ({
        rating: Number(review.rating),
        content: review.content,
        created_at: review.created_at,
      })),
    }),
  });

  if (
    !Number.isInteger(result.score) ||
    result.score < 0 ||
    result.score > 100 ||
    !["up", "down", "stable"].includes(result.trend)
  ) {
    throw new Error("OpenAI zwróciło nieprawidłowy wynik analizy.");
  }

  const { error: saveError } = await supabase
    .from("ai_business_analyses")
    .insert({
      business_id: business.id,
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
      review_count: reviews.length,
      score: result.score,
      trend: result.trend,
      summary: result.summary.trim(),
      praised_elements: result.praised_elements,
      reported_problems: result.reported_problems,
      recommendations: result.recommendations,
      model: openAIModel,
    });

  if (saveError) {
    throw new Error("Nie udało się zapisać analizy opinii.");
  }

  await incrementAiUsage({
    userId: user.id,
    usageKind: "analysis",
    periodMonth: usage.periodMonth,
  });

  revalidatePath("/dashboard");
  revalidatePath("/analysis");
}
