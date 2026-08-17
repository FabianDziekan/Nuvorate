"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { GenerateReviewResponseState } from "@/components/dashboard/review-response-state";
import { generateReviewResponseForReview } from "@/app/dashboard/review-response-service";
import { generateBusinessAnalysisSnapshot } from "@/lib/business-analysis-service";
import {
  getNextAutomaticAnalysisDate,
  normalizeAutomaticAnalysisFrequency,
} from "@/lib/analysis-snapshot";
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
  message: string;
  connected: boolean;
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
      message: "Nie udało się odczytać danych firmy.",
      connected: false,
      success: false,
    };
  }

  const { data: connection } = await supabase.from("google_business_connections").select("id").eq("business_id", business.id).maybeSingle();
  return {
    message: connection ? "Profil Google jest połączony. Synchronizacja opinii zostanie dodana w kolejnym etapie." : "Najpierw połącz profil Google Business w Ustawieniach.",
    connected: Boolean(connection),
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

  const result = await generateBusinessAnalysisSnapshot({
    business,
    executionType: "manual",
    plan,
    userId: user.id,
  });

  if (!result.ok) {
    aiErrorRedirect(
      redirectPath,
      result.reason === "limit"
        ? "limit"
        : result.reason === "no_reviews"
          ? "no_reviews"
          : "technical",
    );
  }

  revalidatePath("/dashboard");
  revalidatePath("/analysis");
}

export async function updateAutomaticAnalysisSettings(input: {
  enabled: boolean;
  frequencyDays: number;
}): Promise<{ error?: string; success: boolean }> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    redirect("/login?next=/analysis");
  }

  const [{ data: business }, { data: profile }] = await Promise.all([
    supabase
      .from("businesses")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("plan")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  if (!business || !hasPlanCapability(normalizePlan(profile?.plan), "automaticAnalysis")) {
    return {
      error: "Automatyczna analiza jest dostępna w planie Business.",
      success: false,
    };
  }

  const frequencyDays = normalizeAutomaticAnalysisFrequency(input.frequencyDays);
  const now = new Date();
  const { error } = await createAdminClient()
    .from("business_analysis_automation")
    .upsert(
      {
        business_id: business.id,
        frequency_days: frequencyDays,
        is_enabled: Boolean(input.enabled),
        last_skip_reason: null,
        next_run_at: input.enabled
          ? getNextAutomaticAnalysisDate(frequencyDays, now).toISOString()
          : null,
      },
      { onConflict: "business_id" },
    );

  if (error) {
    console.error("Automatic analysis settings update failed", error);
    if (error.code === "PGRST205" || error.code === "42P01") {
      return {
        error:
          "Brakuje migracji 019_automatic_business_analysis.sql w Supabase. Ustawienia automatycznej analizy nie zostały jeszcze utworzone.",
        success: false,
      };
    }

    return {
      error: `Nie udało się zapisać ustawień automatycznej analizy (${error.code ?? "nieznany błąd"}).`,
      success: false,
    };
  }

  revalidatePath("/analysis");
  return { success: true };
}
