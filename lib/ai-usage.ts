import "server-only";

import {
  currentPeriodMonth,
  getAiLimit,
  getAiLimitMessage,
  type AiUsageKind,
  type AppPlan,
} from "@/lib/plans";
import { createAdminClient } from "@/lib/supabase/admin";

type ReservationRow = {
  reservation_id: string | null;
  reserved: boolean;
  used: number;
};

export type AiUsageReservation =
  | {
      ok: true;
      id: string;
      periodMonth: string;
    }
  | {
      ok: false;
      error: string;
      reason: "limit" | "technical";
    };

export async function reserveAiUsage({
  plan,
  usageKind,
  userId,
}: {
  plan: AppPlan;
  usageKind: AiUsageKind;
  userId: string;
}): Promise<AiUsageReservation> {
  const admin = createAdminClient();
  const periodMonth = currentPeriodMonth();
  const limit = getAiLimit(plan, usageKind);
  const { data, error } = await admin.rpc("reserve_ai_usage", {
    p_limit: limit,
    p_period_month: periodMonth,
    p_usage_kind: usageKind,
    p_user_id: userId,
  });

  if (error) {
    console.error("Atomic AI usage reservation failed", error);
    return {
      ok: false,
      reason: "technical",
      error:
        usageKind === "reply"
          ? "Nie udało się zarezerwować limitu odpowiedzi. Spróbuj ponownie."
          : "Nie udało się zarezerwować limitu analizy. Spróbuj ponownie.",
    };
  }

  const row = (Array.isArray(data) ? data[0] : data) as ReservationRow | null;

  if (!row?.reserved || !row.reservation_id) {
    return {
      ok: false,
      reason: "limit",
      error: getAiLimitMessage(plan, usageKind),
    };
  }

  return {
    ok: true,
    id: row.reservation_id,
    periodMonth,
  };
}

export async function completeAiUsageReservation(
  reservationId: string,
  userId: string,
) {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("complete_ai_usage_reservation", {
    p_reservation_id: reservationId,
    p_user_id: userId,
  });

  if (error || data !== true) {
    throw new Error("Nie udało się zatwierdzić wykorzystania limitu AI.");
  }
}

export async function releaseAiUsageReservation(
  reservationId: string,
  userId: string,
) {
  const admin = createAdminClient();
  const { error } = await admin.rpc("release_ai_usage_reservation", {
    p_reservation_id: reservationId,
    p_user_id: userId,
  });

  if (error) {
    console.error("AI usage reservation rollback failed", {
      error,
      reservationId,
      userId,
    });
  }
}
