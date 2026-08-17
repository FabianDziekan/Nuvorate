export type AnalysisSnapshotComparison = {
  currentScore: number | null;
  previousCreatedAt: string | null;
  previousScore: number | null;
  status:
    | "rising"
    | "stable"
    | "slight_down"
    | "falling"
    | "no_data";
};

type AnalysisSnapshot = {
  created_at: string;
  score: number | null;
};

export function compareAnalysisSnapshots(
  current: AnalysisSnapshot | null,
  previous: AnalysisSnapshot | null,
): AnalysisSnapshotComparison {
  const currentScore = typeof current?.score === "number" ? current.score : null;
  const previousScore = typeof previous?.score === "number" ? previous.score : null;

  if (currentScore === null || previousScore === null) {
    return {
      currentScore,
      previousCreatedAt: null,
      previousScore: null,
      status: "no_data",
    };
  }

  const difference = currentScore - previousScore;

  return {
    currentScore,
    previousCreatedAt: previous?.created_at ?? null,
    previousScore,
    status:
      difference >= 3
        ? "rising"
        : difference <= -6
          ? "falling"
          : difference <= -3
            ? "slight_down"
            : "stable",
  };
}

export function getNextAutomaticAnalysisDate(
  frequencyDays: number,
  from = new Date(),
) {
  const next = new Date(from);
  next.setUTCDate(next.getUTCDate() + frequencyDays);
  return next;
}

export function normalizeAutomaticAnalysisFrequency(value: unknown) {
  const frequency = Number(value);
  return [7, 14, 30].includes(frequency) ? frequency : 14;
}
