import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { classifyManualReviewCount, isCompleteManualReviewBatch, isWithinManualAnalysisContentBudget, manualAnalysisRangeQuery, parseManualAnalysisRange } from "./manual-analysis-range.ts";

const now = new Date("2026-09-23T14:30:00.000Z");
const source = (path: string) => readFileSync(join(process.cwd(), path), "utf8");

test("manual presets are resolved on the server to UTC bounds", () => {
  assert.equal(parseManualAnalysisRange({}, now)?.start.toISOString(), "2026-08-25T00:00:00.000Z");
  assert.equal(parseManualAnalysisRange({ preset: "3m" }, now)?.start.toISOString(), "2026-06-23T00:00:00.000Z");
  assert.equal(parseManualAnalysisRange({ preset: "12m" }, now)?.start.toISOString(), "2025-09-23T00:00:00.000Z");
  assert.equal(parseManualAnalysisRange({ preset: "30d" }, now)?.end.toISOString(), now.toISOString());
  assert.equal(parseManualAnalysisRange({ preset: "unknown" }, now), null);
});

test("custom range validates real days, order, future and twelve-month cap", () => {
  const valid = parseManualAnalysisRange({ preset: "custom", from: "2026-09-01", to: "2026-09-22" }, now);
  assert.equal(valid?.start.toISOString(), "2026-09-01T00:00:00.000Z");
  assert.equal(valid?.end.toISOString(), "2026-09-23T00:00:00.000Z");
  assert.equal(manualAnalysisRangeQuery(valid!), "analysis_range=custom&analysis_from=2026-09-01&analysis_to=2026-09-22");
  assert.equal(parseManualAnalysisRange({ preset: "custom", from: "2026-09-23", to: "2026-09-23" }, now)?.end.toISOString(), now.toISOString());
  for (const [from, to] of [
    ["2026-09-22", "2026-09-01"],
    ["2026-09-23", "2026-09-24"],
    ["2025-09-22", "2026-09-23"],
    ["2026-02-30", "2026-03-01"],
    ["2026-09-01", "not-a-date"],
  ]) {
    assert.equal(parseManualAnalysisRange({ preset: "custom", from, to }, now), null);
  }
});

test("zero reviews are skipped, one review is valid, and partial/oversized sets are rejected", () => {
  assert.equal(classifyManualReviewCount(0), "no_reviews");
  assert.equal(classifyManualReviewCount(1), "ok");
  assert.equal(classifyManualReviewCount(501), "too_many_reviews");
  assert.equal(isCompleteManualReviewBatch(1, ["One review"]), true);
  assert.equal(isCompleteManualReviewBatch(2, ["One review"]), false);
  assert.equal(isWithinManualAnalysisContentBudget(["Short text"]), true);
  assert.equal(isWithinManualAnalysisContentBudget(["x".repeat(100_001)]), false);
});

test("manual selection reaches a server-side review query, not OpenAI directly", () => {
  const picker = source("components/dashboard/trend-range-select.tsx");
  const page = source("app/(dashboard)/analysis/page.tsx");
  const form = source("components/dashboard/analysis-action-form.tsx");
  const action = source("app/dashboard/actions.ts");
  const service = source("lib/business-analysis-service.ts");
  assert.match(picker, /rangeParam = "trend_range"/);
  assert.match(picker, /customValue/);
  assert.match(picker, /fixed inset-0 z-\[100\] flex items-end/);
  assert.match(page, /rangeParam="analysis_range"/);
  assert.match(form, /name="analysisRange"/);
  assert.match(action, /parseManualAnalysisRange\(/);
  assert.match(action, /manualPeriod: manualRange/);
  assert.match(service, /\.gte\("created_at", periodStart\.toISOString\(\)\)/);
  assert.match(service, /reviewsQuery\.lt\("created_at", periodEnd\.toISOString\(\)\)/);
  assert.match(service, /isCompleteManualReviewBatch\(expectedReviewCount/);
  assert.match(service, /review_count: reviews\.length/);
  assert.match(service, /period_start: periodStart\.toISOString\(\)/);
  assert.match(service, /period_end: periodEnd\.toISOString\(\)/);
  assert.match(service, /if \(!reviews\?\.length\)/);
  assert.match(service, /if \(!manualPeriod\) periodStart\.setUTCDate/);
  assert.doesNotMatch(picker, /generateBusinessAnalysis|reserveAiUsage/);
  assert.doesNotMatch(source("lib/automatic-business-analysis-worker.ts"), /manualPeriod/);
});
