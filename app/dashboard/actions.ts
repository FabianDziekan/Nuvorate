"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  businessAnalysisSchema,
  businessAnalysisSystemPrompt,
} from "@/lib/ai-config";
import type { GenerateReviewResponseState } from "@/components/dashboard/review-response-state";
import { generateReviewResponseForReview } from "@/app/dashboard/review-response-service";
import {
  completeAiUsageReservation,
  releaseAiUsageReservation,
  reserveAiUsage,
} from "@/lib/ai-usage";
import {
  generateStructuredOutput,
  openAIModel,
} from "@/lib/openai";
import { hasPlanCapability, normalizePlan } from "@/lib/plans";
import type { AnalysisErrorCode } from "@/lib/analysis-feedback";
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

function aiErrorRedirect(path: string, code: AnalysisErrorCode): never {
  const separator = path.includes("?") ? "&" : "?";
  redirect(`${path}${separator}ai_error=${code}`);
}

class AnalysisGenerationError extends Error {
  readonly code: AnalysisErrorCode;

  constructor(code: AnalysisErrorCode) {
    super(code);
    this.name = "AnalysisGenerationError";
    this.code = code;
  }
}

export async function generateReviewResponse(
  _previousState: GenerateReviewResponseState,
  formData: FormData,
): Promise<GenerateReviewResponseState> {
  return generateReviewResponseForReview(_previousState, formData);
}

export async function generateBusinessAnalysis(formData?: FormData) {
  const requestedRedirectPath =
    typeof formData?.get("redirectTo") === "string"
      ? String(formData.get("redirectTo"))
      : "/dashboard";
  const redirectPath =
    requestedRedirectPath === "/analysis" ? "/analysis" : "/dashboard";
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

  if (!hasPlanCapability(plan, "basicAnalysis")) {
    aiErrorRedirect(redirectPath, "technical");
  }

  const reservation = await reserveAiUsage({
    plan,
    usageKind: "analysis",
    userId: user.id,
  });

  if (!reservation.ok) {
    aiErrorRedirect(
      redirectPath,
      reservation.reason === "limit" ? "limit" : "technical",
    );
  }

  try {
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
      throw new AnalysisGenerationError("technical");
    }

    if (!reviews.length) {
      throw new AnalysisGenerationError("no_reviews");
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

    const { error: saveError } = await createAdminClient()
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

    await completeAiUsageReservation(reservation.id, user.id);
    revalidatePath("/dashboard");
    revalidatePath("/analysis");
  } catch (error) {
    await releaseAiUsageReservation(reservation.id, user.id);
    aiErrorRedirect(
      redirectPath,
      error instanceof AnalysisGenerationError ? error.code : "technical",
    );
  }
}
