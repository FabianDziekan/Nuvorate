import "server-only";

import {
  businessAnalysisSchema,
  businessAnalysisSystemPrompt,
} from "@/lib/ai-config";
import {
  businessAnalysisQualityRetryInstruction,
  isValidBusinessAnalysis,
  type GeneratedBusinessAnalysis,
} from "@/lib/analysis-quality";
import {
  completeAiUsageReservation,
  releaseAiUsageReservation,
  reserveAiUsage,
} from "@/lib/ai-usage";
import { generateStructuredOutput, openAIModel } from "@/lib/openai";
import type { AppPlan } from "@/lib/plans";
import { createAdminClient } from "@/lib/supabase/admin";

type AnalysisExecutionType = "automatic" | "manual";

type AnalysisBusiness = {
  city: string | null;
  id: string;
  industry: string | null;
  name: string | null;
};

type AnalysisResult =
  | { ok: true }
  | { ok: false; reason: "limit" | "no_reviews" | "technical" };

export async function generateBusinessAnalysisSnapshot({
  business,
  executionType,
  plan,
  userId,
}: {
  business: AnalysisBusiness;
  executionType: AnalysisExecutionType;
  plan: AppPlan;
  userId: string;
}): Promise<AnalysisResult> {
  const reservation = await reserveAiUsage({
    plan,
    usageKind: "analysis",
    userId,
  });

  if (!reservation.ok) {
    return { ok: false, reason: reservation.reason === "limit" ? "limit" : "technical" };
  }

  try {
    const periodEnd = new Date();
    const periodStart = new Date(periodEnd);
    periodStart.setUTCDate(periodStart.getUTCDate() - 30);
    const admin = createAdminClient();
    const { data: reviews, error: reviewsError } = await admin
      .from("reviews")
      .select("rating, content, created_at")
      .eq("business_id", business.id)
      .gte("created_at", periodStart.toISOString())
      .lte("created_at", periodEnd.toISOString())
      .order("created_at", { ascending: false });

    if (reviewsError) {
      return { ok: false, reason: "technical" };
    }

    if (!reviews?.length) {
      return { ok: false, reason: "no_reviews" };
    }

    const userInput = JSON.stringify({
      business: { name: business.name, industry: business.industry, city: business.city },
      period: { start: periodStart.toISOString(), end: periodEnd.toISOString() },
      reviews: reviews.map((review) => ({
        rating: Number(review.rating),
        content: review.content,
        created_at: review.created_at,
      })),
    });
    let result: GeneratedBusinessAnalysis | null = null;

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const candidate = await generateStructuredOutput<GeneratedBusinessAnalysis>({
        schemaName: "business_review_analysis",
        schema: businessAnalysisSchema,
        system:
          attempt === 0
            ? businessAnalysisSystemPrompt
            : `${businessAnalysisSystemPrompt}\n\n${businessAnalysisQualityRetryInstruction}`,
        user: userInput,
      });

      if (isValidBusinessAnalysis(candidate)) {
        result = candidate;
        break;
      }
    }

    if (!result) {
      console.error("Business analysis rejected by language-quality validation");
      return { ok: false, reason: "technical" };
    }

    const ratings = reviews
      .map((review) => Number(review.rating))
      .filter((rating) => Number.isFinite(rating));
    const reviewCount = ratings.length;
    const averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / reviewCount;
    const positiveReviewShare = (ratings.filter((rating) => rating >= 4).length / reviewCount) * 100;
    const negativeReviewShare = (ratings.filter((rating) => rating <= 2).length / reviewCount) * 100;

    const { error: saveError } = await admin.from("ai_business_analyses").insert({
      analysis_type: executionType,
      average_rating: Number(averageRating.toFixed(2)),
      business_id: business.id,
      model: openAIModel,
      negative_review_share: Number(negativeReviewShare.toFixed(2)),
      period_end: periodEnd.toISOString(),
      period_start: periodStart.toISOString(),
      positive_review_share: Number(positiveReviewShare.toFixed(2)),
      praised_elements: result.praised_elements,
      recommendations: result.recommendations,
      reported_problems: result.reported_problems,
      review_count: reviews.length,
      score: result.score,
      summary: result.summary.trim(),
      trend: result.trend,
    });

    if (saveError) {
      return { ok: false, reason: "technical" };
    }

    await completeAiUsageReservation(reservation.id, userId);
    return { ok: true };
  } catch (error) {
    console.error("Business analysis generation failed", error);
    return { ok: false, reason: "technical" };
  } finally {
    // A completed reservation is ignored by the rollback function; an errored
    // generation releases its atomic reservation and returns the monthly quota.
    await releaseAiUsageReservation(reservation.id, userId);
  }
}
