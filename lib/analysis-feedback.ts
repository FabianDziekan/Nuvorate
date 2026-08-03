import type { AppPlan } from "./plans.ts";

export type AnalysisErrorCode = "limit" | "no_reviews" | "technical";

export type AnalysisFeedback = {
  code: AnalysisErrorCode;
  description: string;
  showBusinessCta: boolean;
  title: string;
};

export function normalizeAnalysisErrorCode(
  value: unknown,
): AnalysisErrorCode | null {
  return value === "limit" || value === "no_reviews" || value === "technical"
    ? value
    : null;
}

export function getAnalysisFeedback(
  code: AnalysisErrorCode,
  plan: AppPlan,
): AnalysisFeedback {
  if (code === "limit") {
    return {
      code,
      title: "Miesięczny limit analiz został wykorzystany",
      description:
        plan === "starter"
          ? "Wykorzystałeś 1 z 1 analiz reputacji w planie Starter. Przejdź na Business, aby odblokować 50 analiz miesięcznie."
          : "Miesięczny limit analiz reputacji został wykorzystany.",
      showBusinessCta: plan === "starter",
    };
  }

  if (code === "no_reviews") {
    return {
      code,
      title: "Brak opinii do analizy",
      description: "Brak opinii z ostatnich 30 dni do przeanalizowania.",
      showBusinessCta: false,
    };
  }

  return {
    code,
    title: "Nie udało się wygenerować analizy",
    description: "Nie udało się wygenerować analizy. Spróbuj ponownie.",
    showBusinessCta: false,
  };
}

export function isStarterAnalysisLimitReached({
  analysesLimit,
  analysesUsed,
  plan,
}: {
  analysesLimit: number;
  analysesUsed: number;
  plan: AppPlan;
}) {
  return (
    plan === "starter" &&
    analysesLimit === 1 &&
    analysesUsed >= analysesLimit
  );
}
