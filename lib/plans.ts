export type AppPlan = "unpaid" | "starter" | "business";
export type PaidPlan = "starter" | "business";
export type AiUsageKind = "reply" | "analysis";

export const planConfig = {
  unpaid: {
    label: "Unpaid",
    aiRepliesLimit: 0,
    aiAnalysesLimit: 0,
  },
  starter: {
    label: "Starter",
    aiRepliesLimit: 50,
    aiAnalysesLimit: 1,
  },
  business: {
    label: "Business",
    aiRepliesLimit: 350,
    aiAnalysesLimit: 50,
  },
} satisfies Record<
  AppPlan,
  {
    label: string;
    aiRepliesLimit: number;
    aiAnalysesLimit: number;
  }
>;

export function normalizePlan(plan: unknown): AppPlan {
  if (plan === "starter" || plan === "business" || plan === "unpaid") {
    return plan;
  }

  return "unpaid";
}

export function getPlanLabel(plan: unknown) {
  return planConfig[normalizePlan(plan)].label;
}

export function isPaidPlan(plan: unknown): plan is PaidPlan {
  return plan === "starter" || plan === "business";
}

export function getAiLimit(plan: AppPlan, usageKind: AiUsageKind) {
  return usageKind === "reply"
    ? planConfig[plan].aiRepliesLimit
    : planConfig[plan].aiAnalysesLimit;
}

export function getAiLimitMessage(
  plan: AppPlan,
  usageKind: AiUsageKind,
  allLimitsReached = false,
) {
  if (plan === "unpaid") {
    return "Wybierz plan, aby korzystać z odpowiedzi na opinie i analiz reputacji.";
  }

  if (allLimitsReached) {
    return "Wszystkie odpowiedzi na opinie i analizy reputacji zostały wykorzystane. Limity odnowią się w kolejnym okresie rozliczeniowym.";
  }

  if (plan === "starter" && usageKind === "analysis") {
    return "Wykorzystałeś analizę reputacji w planie Starter. Przejdź na Business, aby odblokować więcej analiz.";
  }

  if (plan === "starter" && usageKind === "reply") {
    return "Wykorzystałeś limit odpowiedzi na opinie w planie Starter.";
  }

  return usageKind === "reply"
    ? "Osiągnięto miesięczny limit odpowiedzi na opinie. Limit odnowi się w kolejnym okresie rozliczeniowym."
    : "Osiągnięto miesięczny limit analiz reputacji. Limit odnowi się w kolejnym okresie rozliczeniowym.";
}

export function currentPeriodMonth(date = new Date()) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-01`;
}
