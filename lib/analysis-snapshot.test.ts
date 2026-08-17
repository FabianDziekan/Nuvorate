import assert from "node:assert/strict";
import test from "node:test";
import {
  compareAnalysisSnapshots,
  getNextAutomaticAnalysisDate,
  normalizeAutomaticAnalysisFrequency,
} from "./analysis-snapshot.ts";

test("analysis snapshots classify score changes against the previous snapshot", () => {
  const current = { created_at: "2026-08-13T10:00:00.000Z", score: 86 };
  const previous = { created_at: "2026-07-30T10:00:00.000Z", score: 81 };

  assert.equal(compareAnalysisSnapshots(current, previous).status, "rising");
  assert.equal(compareAnalysisSnapshots({ ...current, score: 78 }, previous).status, "slight_down");
  assert.equal(compareAnalysisSnapshots({ ...current, score: 74 }, previous).status, "falling");
  assert.equal(compareAnalysisSnapshots({ ...current, score: 82 }, previous).status, "stable");
});

test("first snapshot has no comparison baseline", () => {
  assert.equal(
    compareAnalysisSnapshots({ created_at: "2026-08-13T10:00:00.000Z", score: 86 }, null).status,
    "no_data",
  );
});

test("automatic analysis accepts only supported frequencies", () => {
  assert.equal(normalizeAutomaticAnalysisFrequency(7), 7);
  assert.equal(normalizeAutomaticAnalysisFrequency(14), 14);
  assert.equal(normalizeAutomaticAnalysisFrequency(30), 30);
  assert.equal(normalizeAutomaticAnalysisFrequency(5), 14);
  assert.equal(
    getNextAutomaticAnalysisDate(14, new Date("2026-08-13T00:00:00.000Z")).toISOString(),
    "2026-08-27T00:00:00.000Z",
  );
});
