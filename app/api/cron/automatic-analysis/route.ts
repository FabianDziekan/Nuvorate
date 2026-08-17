import { NextResponse } from "next/server";
import { getNextAutomaticAnalysisDate } from "@/lib/analysis-snapshot";
import { generateBusinessAnalysisSnapshot } from "@/lib/business-analysis-service";
import { normalizePlan } from "@/lib/plans";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  return Boolean(secret && authorization === `Bearer ${secret}`);
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = new Date();
  const { data: schedules, error: schedulesError } = await admin
    .from("business_analysis_automation")
    .select("business_id, frequency_days")
    .eq("is_enabled", true)
    .lte("next_run_at", now.toISOString())
    .limit(100);

  if (schedulesError) {
    console.error("Automatic analysis schedule lookup failed", schedulesError);
    return NextResponse.json({ error: "Unable to read schedules" }, { status: 500 });
  }

  let completed = 0;
  let skippedForLimit = 0;

  for (const schedule of schedules ?? []) {
    const { data: business } = await admin
      .from("businesses")
      .select("id, name, industry, city, owner_id")
      .eq("id", schedule.business_id)
      .maybeSingle();
    const { data: profile } = business?.owner_id
      ? await admin
          .from("profiles")
          .select("plan")
          .eq("user_id", business.owner_id)
          .maybeSingle()
      : { data: null };

    const ownerId = business?.owner_id;
    const plan = normalizePlan(profile?.plan);

    if (!business || !ownerId || plan !== "business") {
      await admin
        .from("business_analysis_automation")
        .update({
          is_enabled: false,
          last_skip_reason: "Plan Business nie jest aktywny.",
          next_run_at: null,
        })
        .eq("business_id", schedule.business_id);
      continue;
    }

    const result = await generateBusinessAnalysisSnapshot({
      business,
      executionType: "automatic",
      plan,
      userId: ownerId,
    });

    if (result.ok) {
      completed += 1;
      await admin
        .from("business_analysis_automation")
        .update({
          last_run_at: now.toISOString(),
          last_skip_reason: null,
          next_run_at: getNextAutomaticAnalysisDate(schedule.frequency_days, now).toISOString(),
        })
        .eq("business_id", schedule.business_id);
      continue;
    }

    if (result.reason === "limit") {
      skippedForLimit += 1;
      await admin
        .from("business_analysis_automation")
        .update({
          last_skip_reason: "Automatyczna analiza została pominięta — wykorzystano miesięczny limit analiz.",
        })
        .eq("business_id", schedule.business_id);
      continue;
    }

    await admin
      .from("business_analysis_automation")
      .update({
        last_skip_reason:
          result.reason === "no_reviews"
            ? "Automatyczna analiza została pominięta — brak opinii do analizy."
            : "Automatyczna analiza nie została wykonana. Spróbujemy ponownie przy kolejnym terminie.",
        next_run_at: getNextAutomaticAnalysisDate(schedule.frequency_days, now).toISOString(),
      })
      .eq("business_id", schedule.business_id);
  }

  return NextResponse.json({ completed, skippedForLimit });
}
