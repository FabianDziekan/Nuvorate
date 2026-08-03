import assert from "node:assert/strict";
import test from "node:test";
import {
  projectAnalysisForPlan,
  type StoredBusinessAnalysis,
} from "./analysis-projection.ts";

const storedAnalysis: StoredBusinessAnalysis = {
  created_at: "2026-07-24T10:00:00.000Z",
  period_start: "2026-06-24T10:00:00.000Z",
  period_end: "2026-07-24T10:00:00.000Z",
  review_count: 18,
  score: 82,
  trend: "up",
  summary:
    "Klienci wysoko oceniają obsługę. Najwięcej uwag dotyczy czasu oczekiwania. Warto usprawnić komunikację. To zdanie nie powinno trafić do Startera.",
  praised_elements: ["Profesjonalna obsługa", "Atmosfera"],
  reported_problems: ["Czas oczekiwania", "Parking"],
  recommendations: ["Wysyłaj klientom informację o opóźnieniach", "Zmień oznaczenia"],
};

test("Starter receives only the five-field basic analysis projection", () => {
  const projection = projectAnalysisForPlan("starter", storedAnalysis);
  assert.deepEqual(Object.keys(projection).sort(), [
    "actionTip",
    "createdAt",
    "keyProblem",
    "kind",
    "reputationScore",
    "reviewCount",
    "strongestStrength",
    "summary",
  ]);
  assert.equal(projection.kind, "basic");
  assert.equal(projection.reputationScore, 82);
  assert.equal(projection.strongestStrength, "Profesjonalna obsługa");
  assert.equal(projection.keyProblem, "Czas oczekiwania");
  assert.equal(
    projection.actionTip,
    "Wysyłaj klientom informację o opóźnieniach",
  );
  assert.doesNotMatch(projection.summary, /To zdanie/);
  assert.equal("trend" in projection, false);
  assert.equal("recommendations" in projection, false);
});

test("Business receives the complete stored analysis", () => {
  const projection = projectAnalysisForPlan("business", storedAnalysis);
  assert.equal(projection.kind, "full");
  assert.equal(projection.trend, "up");
  assert.deepEqual(projection.reported_problems, [
    "Czas oczekiwania",
    "Parking",
  ]);
  assert.deepEqual(projection.recommendations, [
    "Wysyłaj klientom informację o opóźnieniach",
    "Zmień oznaczenia",
  ]);
});
