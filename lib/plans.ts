export type AppPlan = "unpaid" | "starter" | "business";
export type PaidPlan = "starter" | "business";
export type AiUsageKind = "reply" | "analysis";
export type PlanCapability =
  | "basicDashboard"
  | "reviews"
  | "manualReviewResponses"
  | "basicAnalysis"
  | "notifications"
  | "nfcBasicStats"
  | "settings"
  | "businessInsights"
  | "fullAnalysis"
  | "authorVerification"
  | "automaticAnalysis"
  | "automaticReviewResponses"
  | "nfcAdvancedStats";

type PlanCapabilities = Readonly<Record<PlanCapability, boolean>>;

const unpaidCapabilities = {
  basicDashboard: false,
  reviews: false,
  manualReviewResponses: false,
  basicAnalysis: false,
  notifications: false,
  nfcBasicStats: false,
  settings: false,
  businessInsights: false,
  fullAnalysis: false,
  authorVerification: false,
  automaticAnalysis: false,
  automaticReviewResponses: false,
  nfcAdvancedStats: false,
} as const satisfies PlanCapabilities;

const starterCapabilities = {
  basicDashboard: true,
  reviews: true,
  manualReviewResponses: true,
  basicAnalysis: true,
  notifications: true,
  nfcBasicStats: true,
  settings: true,
  businessInsights: false,
  fullAnalysis: false,
  authorVerification: false,
  automaticAnalysis: false,
  automaticReviewResponses: false,
  nfcAdvancedStats: false,
} as const satisfies PlanCapabilities;

const businessCapabilities = {
  ...starterCapabilities,
  businessInsights: true,
  fullAnalysis: true,
  authorVerification: true,
  automaticAnalysis: true,
  automaticReviewResponses: true,
  nfcAdvancedStats: true,
} as const satisfies PlanCapabilities;

export const planConfig = {
  unpaid: {
    label: "Unpaid",
    aiRepliesLimit: 0,
    aiAnalysesLimit: 0,
    capabilities: unpaidCapabilities,
  },
  starter: {
    label: "Starter",
    aiRepliesLimit: 50,
    aiAnalysesLimit: 1,
    capabilities: starterCapabilities,
  },
  business: {
    label: "Business",
    aiRepliesLimit: 350,
    aiAnalysesLimit: 50,
    capabilities: businessCapabilities,
  },
} satisfies Record<
  AppPlan,
  {
    label: string;
    aiRepliesLimit: number;
    aiAnalysesLimit: number;
    capabilities: PlanCapabilities;
  }
>;

export class PlanCapabilityError extends Error {
  readonly capability: PlanCapability;
  readonly plan: AppPlan;

  constructor(plan: AppPlan, capability: PlanCapability) {
    super(`Plan ${plan} nie udostępnia funkcji ${capability}.`);
    this.name = "PlanCapabilityError";
    this.plan = plan;
    this.capability = capability;
  }
}

export function normalizePlan(plan: unknown): AppPlan {
  const normalizedPlan =
    typeof plan === "string" ? plan.trim().toLowerCase() : plan;

  if (
    normalizedPlan === "starter" ||
    normalizedPlan === "business" ||
    normalizedPlan === "unpaid"
  ) {
    return normalizedPlan;
  }

  return "unpaid";
}

export function getPlanLabel(plan: unknown) {
  return planConfig[normalizePlan(plan)].label;
}

export function isPaidPlan(plan: unknown) {
  const normalizedPlan = normalizePlan(plan);
  return normalizedPlan === "starter" || normalizedPlan === "business";
}

export function hasPlanCapability(
  plan: unknown,
  capability: PlanCapability,
) {
  return planConfig[normalizePlan(plan)].capabilities[capability];
}

export function requirePlanCapability(
  plan: unknown,
  capability: PlanCapability,
) {
  const normalizedPlan = normalizePlan(plan);

  if (!hasPlanCapability(normalizedPlan, capability)) {
    throw new PlanCapabilityError(normalizedPlan, capability);
  }
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
