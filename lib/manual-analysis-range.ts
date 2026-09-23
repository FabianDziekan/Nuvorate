export type ManualAnalysisPreset = "30d" | "3m" | "12m" | "custom";

export type ManualAnalysisRangeInput = {
  preset?: string | null;
  from?: string | null;
  to?: string | null;
};

export type ManualAnalysisRange = {
  preset: ManualAnalysisPreset;
  from?: string;
  to?: string;
  start: Date;
  end: Date; // Exclusive UTC bound, except for a range ending today.
  label: string;
};

export const MAX_MANUAL_ANALYSIS_REVIEWS = 500;
export const MAX_MANUAL_ANALYSIS_CONTENT_CHARACTERS = 100_000;

export function classifyManualReviewCount(count: number) {
  if (count === 0) return "no_reviews" as const;
  if (count > MAX_MANUAL_ANALYSIS_REVIEWS) return "too_many_reviews" as const;
  return "ok" as const;
}

export function isCompleteManualReviewBatch(expectedCount: number, contents: string[]) {
  return contents.length === expectedCount;
}

export function isWithinManualAnalysisContentBudget(contents: string[]) {
  return contents.reduce((sum, content) => sum + content.length, 0) <= MAX_MANUAL_ANALYSIS_CONTENT_CHARACTERS;
}

function parseUtcDay(value: string | null | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
    ? date
    : null;
}

function utcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addUtcDays(date: Date, days: number) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function addUtcMonths(date: Date, months: number) {
  const firstOfTarget = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
  const lastDay = new Date(Date.UTC(firstOfTarget.getUTCFullYear(), firstOfTarget.getUTCMonth() + 1, 0)).getUTCDate();
  return new Date(Date.UTC(firstOfTarget.getUTCFullYear(), firstOfTarget.getUTCMonth(), Math.min(date.getUTCDate(), lastDay)));
}

export function parseManualAnalysisRange(
  input: ManualAnalysisRangeInput,
  now = new Date(),
): ManualAnalysisRange | null {
  if (!Number.isFinite(now.getTime())) return null;
  const preset = input.preset ?? "30d";
  const today = utcDay(now);

  if (preset === "custom") {
    const from = parseUtcDay(input.from);
    const to = parseUtcDay(input.to);
    if (!from || !to || from > to || to > today || to > addUtcMonths(from, 12)) return null;
    return {
      preset,
      from: input.from!,
      to: input.to!,
      start: from,
      end: to.getTime() === today.getTime() ? now : addUtcDays(to, 1),
      label: `${input.from} – ${input.to}`,
    };
  }

  if (preset !== "30d" && preset !== "3m" && preset !== "12m") return null;
  const start = preset === "30d"
    ? addUtcDays(today, -29)
    : addUtcMonths(today, preset === "3m" ? -3 : -12);
  return {
    preset,
    start,
    end: now,
    label: preset === "30d" ? "Ostatnie 30 dni" : preset === "3m" ? "Ostatnie 3 miesiące" : "Ostatnie 12 miesięcy",
  };
}

export function manualAnalysisRangeQuery(range: ManualAnalysisRange) {
  const params = new URLSearchParams({ analysis_range: range.preset });
  if (range.preset === "custom") {
    params.set("analysis_from", range.from!);
    params.set("analysis_to", range.to!);
  }
  return params.toString();
}
