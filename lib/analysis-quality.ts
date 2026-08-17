export type GeneratedBusinessAnalysis = {
  praised_elements: string[];
  recommendations: string[];
  reported_problems: string[];
  score: number;
  summary: string;
  trend: "up" | "down" | "stable";
};

const forbiddenArtifacts = [
  /\b(wait|maybe|actually|bonjour|complains|cedera)\b/i,
  /\b(i('| a)m sorry|let me|as an ai|myślę, że|przepraszam, ale)\b/i,
  /\bno\s*[?.!]/i,
];

function sentenceCount(value: string) {
  return value
    .split(/[.!?]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean).length;
}

function isReadyPolishText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return false;

  const normalized = value.trim();
  if (normalized.length < 15 || normalized.length > maxLength) return false;
  if (forbiddenArtifacts.some((pattern) => pattern.test(normalized))) return false;
  if (/^(?:[-–—]|\.{2,}|["'])/.test(normalized)) return false;
  if (!/[a-ząćęłńóśźż]/i.test(normalized)) return false;
  return sentenceCount(normalized) <= 2;
}

function isReadyList(value: unknown, maxLength: number) {
  return (
    Array.isArray(value) &&
    value.length >= 1 &&
    value.length <= 3 &&
    value.every((item) => isReadyPolishText(item, maxLength))
  );
}

export function isValidBusinessAnalysis(value: unknown): value is GeneratedBusinessAnalysis {
  if (!value || typeof value !== "object") return false;
  const analysis = value as Partial<GeneratedBusinessAnalysis>;

  return (
    Number.isInteger(analysis.score) &&
    typeof analysis.score === "number" &&
    analysis.score >= 0 &&
    analysis.score <= 100 &&
    ["up", "down", "stable"].includes(analysis.trend ?? "") &&
    typeof analysis.summary === "string" &&
    analysis.summary.trim().length >= 80 &&
    analysis.summary.trim().length <= 900 &&
    !forbiddenArtifacts.some((pattern) => pattern.test(analysis.summary!)) &&
    sentenceCount(analysis.summary) <= 4 &&
    isReadyList(analysis.praised_elements, 320) &&
    isReadyList(analysis.reported_problems, 320) &&
    isReadyList(analysis.recommendations, 360)
  );
}

export const businessAnalysisQualityRetryInstruction = `
Poprzednia odpowiedź nie spełniła standardu językowego NuvoRate.
Wygeneruj raport od nowa wyłącznie po polsku. Każde pole ma być gotową,
profesjonalną wypowiedzią dla właściciela firmy, bez angielskich słów,
metakomentarzy, notatek roboczych i niedokończonych fragmentów.
`.trim();
