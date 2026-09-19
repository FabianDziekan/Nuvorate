import "server-only";

import { randomUUID } from "node:crypto";

import { generateBusinessAnalysisSnapshot } from "@/lib/business-analysis-service";
import { normalizePlan } from "@/lib/plans";
import { createAdminClient } from "@/lib/supabase/admin";

export const AUTOMATIC_ANALYSIS_BATCH_SIZE = 5;
export const AUTOMATIC_ANALYSIS_LEASE_SECONDS = 10 * 60;

export type ClaimedAutomaticAnalysisSchedule = {
  analysis_lease_token: string;
  business_id: string;
  frequency_days: number;
};

export type AutomaticAnalysisWorkerResult =
  | "completed"
  | "limit"
  | "no_reviews"
  | "retry"
  | "skipped";

export async function getDueAutomaticAnalysisScheduleCount() {
  const { count, error } = await createAdminClient()
    .from("business_analysis_automation")
    .select("id", { count: "exact", head: true })
    .eq("is_enabled", true)
    .not("next_run_at", "is", null)
    .lte("next_run_at", new Date().toISOString());

  if (error) throw new Error("Automatic analysis due schedule count failed");
  return count ?? 0;
}

type FinishOutcome = "disabled" | "limit" | "no_reviews" | "success" | "technical";

export async function claimAutomaticAnalysisSchedules(limit = AUTOMATIC_ANALYSIS_BATCH_SIZE) {
  const { data, error } = await createAdminClient().rpc(
    "claim_automatic_business_analysis_schedules",
    {
      p_lease_seconds: AUTOMATIC_ANALYSIS_LEASE_SECONDS,
      p_lease_token: randomUUID(),
      p_limit: Math.min(Math.max(limit, 1), 25),
    },
  );

  if (error) throw new Error("Automatic analysis schedule claim failed");
  return (data ?? []) as ClaimedAutomaticAnalysisSchedule[];
}

async function renewScheduleLease(schedule: ClaimedAutomaticAnalysisSchedule) {
  const { data, error } = await createAdminClient().rpc(
    "renew_automatic_business_analysis_schedule_lease",
    {
      p_business_id: schedule.business_id,
      p_frequency_days: schedule.frequency_days,
      p_lease_seconds: AUTOMATIC_ANALYSIS_LEASE_SECONDS,
      p_lease_token: schedule.analysis_lease_token,
    },
  );

  return !error && data === true;
}

async function releaseScheduleLease(schedule: ClaimedAutomaticAnalysisSchedule) {
  const { data, error } = await createAdminClient().rpc(
    "release_automatic_business_analysis_schedule_lease",
    {
      p_business_id: schedule.business_id,
      p_lease_token: schedule.analysis_lease_token,
    },
  );

  return !error && data === true;
}

async function finishSchedule(
  schedule: ClaimedAutomaticAnalysisSchedule,
  outcome: FinishOutcome,
) {
  const { data, error } = await createAdminClient().rpc(
    "finish_automatic_business_analysis_schedule",
    {
      p_business_id: schedule.business_id,
      p_frequency_days: schedule.frequency_days,
      p_lease_token: schedule.analysis_lease_token,
      p_outcome: outcome,
    },
  );

  return !error && data === true;
}

async function processClaimedAutomaticAnalysisSchedule(
  schedule: ClaimedAutomaticAnalysisSchedule,
): Promise<AutomaticAnalysisWorkerResult> {
  // This recheck prevents an old due claim from running after a user disables
  // automation or changes its frequency.
  if (!(await renewScheduleLease(schedule))) {
    await releaseScheduleLease(schedule);
    return "skipped";
  }

  const admin = createAdminClient();
  const { data: business, error: businessError } = await admin
    .from("businesses")
    .select("id, name, industry, city, owner_id")
    .eq("id", schedule.business_id)
    .maybeSingle();
  if (businessError) {
    if (!(await finishSchedule(schedule, "technical"))) {
      await releaseScheduleLease(schedule);
    }
    return "retry";
  }

  const { data: profile, error: profileError } = business?.owner_id
    ? await admin
        .from("profiles")
        .select("plan")
        .eq("user_id", business.owner_id)
        .maybeSingle()
    : { data: null, error: null };

  if (profileError) {
    if (!(await finishSchedule(schedule, "technical"))) {
      await releaseScheduleLease(schedule);
    }
    return "retry";
  }

  const plan = normalizePlan(profile?.plan);
  if (!business || !business.owner_id || plan !== "business") {
    if (!(await finishSchedule(schedule, "disabled"))) {
      await releaseScheduleLease(schedule);
    }
    return "skipped";
  }

  const result = await generateBusinessAnalysisSnapshot({
    business,
    canProceed: () => renewScheduleLease(schedule),
    executionType: "automatic",
    plan,
    userId: business.owner_id,
  });

  if (result.ok) {
    if (!(await finishSchedule(schedule, "success"))) {
      await releaseScheduleLease(schedule);
      return "skipped";
    }
    return "completed";
  }

  if (result.reason === "cancelled") {
    await releaseScheduleLease(schedule);
    return "skipped";
  }

  const outcome: FinishOutcome = result.reason === "limit"
    ? "limit"
    : result.reason === "no_reviews"
      ? "no_reviews"
      : "technical";

  if (!(await finishSchedule(schedule, outcome))) {
    await releaseScheduleLease(schedule);
    return "skipped";
  }

  if (outcome === "technical") return "retry";
  if (outcome === "limit") return "limit";
  return "no_reviews";
}

/**
 * Processes one schedule already owned by this worker's durable lease. Any
 * unexpected local failure is recorded through the same bounded retry path;
 * if the lease was superseded, the token fence makes this a safe no-op.
 */
export async function processAutomaticAnalysisSchedule(
  schedule: ClaimedAutomaticAnalysisSchedule,
): Promise<AutomaticAnalysisWorkerResult> {
  try {
    return await processClaimedAutomaticAnalysisSchedule(schedule);
  } catch {
    if (!(await finishSchedule(schedule, "technical"))) {
      await releaseScheduleLease(schedule);
    }
    return "retry";
  }
}
