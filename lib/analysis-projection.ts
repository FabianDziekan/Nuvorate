import { hasPlanCapability, type AppPlan } from "./plans.ts";

export type StoredBusinessAnalysis = {
  created_at: string;
  period_start: string;
  period_end: string;
  review_count: number;
  score: number | null;
  trend: "up" | "down" | "stable" | null;
  summary: string;
  praised_elements: unknown;
  reported_problems: unknown;
  recommendations: unknown;
};

export type BasicAnalysisProjection = {
  kind: "basic";
  createdAt: string;
  reviewCount: number;
  reputationScore: number;
  summary: string;
  strongestStrength: string;
  keyProblem: string;
  actionTip: string;
};

export type FullAnalysisProjection = StoredBusinessAnalysis & {
  kind: "full";
};

export type PlanAnalysisProjection =
  | BasicAnalysisProjection
  | FullAnalysisProjection;

function firstString(value: unknown, fallback: string) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const first = value.find(
    (item): item is string => typeof item === "string" && item.trim().length > 0,
  );
  return first?.trim() || fallback;
}

function shortSummary(summary: string) {
  const sentences =
    summary
      .trim()
      .match(/[^.!?]+[.!?]+|[^.!?]+$/g)
      ?.map((sentence) => sentence.trim())
      .filter(Boolean) ?? [];

  return sentences.slice(0, 3).join(" ");
}

export function projectAnalysisForPlan(
  plan: AppPlan,
  analysis: StoredBusinessAnalysis,
): PlanAnalysisProjection {
  if (hasPlanCapability(plan, "fullAnalysis")) {
    return {
      ...analysis,
      kind: "full",
    };
  }

  return {
    kind: "basic",
    createdAt: analysis.created_at,
    reviewCount: analysis.review_count,
    reputationScore:
      typeof analysis.score === "number"
        ? Math.min(100, Math.max(0, Math.round(analysis.score)))
        : 0,
    summary:
      shortSummary(analysis.summary) ||
      "Analiza nie zawiera jeszcze wystarczającego podsumowania.",
    strongestStrength: firstString(
      analysis.praised_elements,
      "Brak wystarczających danych o najmocniejszej stronie.",
    ),
    keyProblem: firstString(
      analysis.reported_problems,
      "Nie wykryto jednego dominującego problemu.",
    ),
    actionTip: firstString(
      analysis.recommendations,
      "Kontynuuj regularne monitorowanie nowych opinii.",
    ),
  };
}
