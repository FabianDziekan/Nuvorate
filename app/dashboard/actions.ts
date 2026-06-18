"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  businessAnalysisSchema,
  businessAnalysisSystemPrompt,
  reviewResponseSchema,
  reviewResponseSystemPrompt,
} from "@/lib/ai-config";
import {
  generateStructuredOutput,
  openAIModel,
} from "@/lib/openai";
import { createClient } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function generateReviewResponse(formData: FormData) {
  const reviewId = formData.get("reviewId");

  if (typeof reviewId !== "string" || !reviewId) {
    throw new Error("Nie wskazano opinii.");
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    redirect("/login?next=/dashboard");
  }

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

  const { error: saveError } = await supabase
    .from("ai_review_responses")
    .upsert(
      {
        business_id: business.id,
        review_id: review.id,
        response_text: result.response.trim(),
        model: openAIModel,
      },
      { onConflict: "review_id" },
    );

  if (saveError) {
    throw new Error("Nie udało się zapisać wygenerowanej odpowiedzi.");
  }

  revalidatePath("/dashboard");
}

export async function generateBusinessAnalysis() {
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

  if (profile.plan !== "business") {
    throw new Error("Analiza wszystkich opinii jest dostępna w planie Business.");
  }

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

  revalidatePath("/dashboard");
  revalidatePath("/analysis");
}
