import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { analysisPickerSelection, customDateRangeParams, presetDateRangeParams } from "./date-range-picker.ts";

const source = readFileSync(
  join(process.cwd(), "components/dashboard/trend-range-select.tsx"),
  "utf8",
);

test("mobile custom date selection keeps the calendar open until the range is applied", () => {
  assert.match(source, /renderCalendar=\{!isMobileViewport\}/);
  assert.match(source, /isMobileViewport && openCalendar/);
  assert.match(source, /<CalendarPanel\s+onSelect=\{openCalendar === "from" \? setCustomFrom : setCustomTo\}/);
  assert.match(source, /function applyCustomRange\(\)[\s\S]*?setOpenCalendar\(null\);/);
});

test("mobile range picker uses a fixed sheet instead of a floating calendar", () => {
  assert.match(source, /fixed inset-0 z-\[100\] flex items-end/);
  assert.match(source, /max-h-\[calc\(100dvh-1rem\)\] w-full overflow-y-auto rounded-t-\[26px\]/);
  assert.match(source, /isMobileViewport\s*\? createPortal\(rangePicker, document\.body\)/);
  assert.doesNotMatch(source, /max-\[768px\]:fixed/);
});

test("analysis 30d to custom writes its own dates and refresh restores the dashboard-style label", () => {
  const keys = { rangeParam: "analysis_range", fromParam: "analysis_from", toParam: "analysis_to", customValue: "custom" };
  const params = customDateRangeParams("analysis_range=30d&tab=overview", keys, "2026-08-01", "2026-09-30");
  assert.equal(params.get("analysis_range"), "custom");
  assert.equal(params.get("analysis_from"), "2026-08-01");
  assert.equal(params.get("analysis_to"), "2026-09-30");
  assert.equal(params.get("tab"), "overview");
  const refreshed = analysisPickerSelection({
    range: params.get("analysis_range") ?? undefined,
    from: params.get("analysis_from") ?? undefined,
    to: params.get("analysis_to") ?? undefined,
  });
  assert.equal(refreshed.preset, "custom");
  assert.equal(refreshed.label, "01.08.2026 – 30.09.2026");
  assert.equal(analysisPickerSelection({ range: "30d" }).label, "Ostatnie 30 dni");
  // Displaying a URL is separate from backend eligibility: the server still rejects future dates on submission.
  assert.match(readFileSync(join(process.cwd(), "app/dashboard/actions.ts"), "utf8"), /parseManualAnalysisRange\(/);
});

test("analysis custom to 3m or 12m removes dates and clears the picker's local inputs", () => {
  const keys = { rangeParam: "analysis_range", fromParam: "analysis_from", toParam: "analysis_to", customValue: "custom" };
  const current = "analysis_range=custom&analysis_from=2026-08-01&analysis_to=2026-09-30";
  for (const preset of ["3m", "12m"] as const) {
    const params = presetDateRangeParams(current, keys, preset);
    assert.equal(params.toString(), `analysis_range=${preset}`);
    const selection = analysisPickerSelection({ range: params.get("analysis_range") ?? undefined });
    assert.equal(selection.from, undefined);
    assert.equal(selection.to, undefined);
    assert.equal(selection.label, preset === "3m" ? "Ostatnie 3 miesiące" : "Ostatnie 12 miesięcy");
  }
  assert.match(source, /setCustomFrom\(""\);\s*setCustomTo\(""\);/);
  assert.match(source, /setCustomFrom\(isCustom \? formatInputDate\(from\) : ""\)/);
});

test("dashboard keeps its original query names and custom label format", () => {
  const keys = { rangeParam: "trend_range", fromParam: "from", toParam: "to" };
  const custom = customDateRangeParams("trend_range=30d", keys, "2026-08-01", "2026-09-30");
  assert.equal(custom.toString(), "from=2026-08-01&to=2026-09-30");
  assert.equal(presetDateRangeParams(custom.toString(), keys, "3m").toString(), "trend_range=3m");
  const dashboard = readFileSync(join(process.cwd(), "app/(dashboard)/dashboard/page.tsx"), "utf8");
  assert.match(dashboard, /formatDateRangeDisplayDay\(customFrom\)/);
  assert.match(source, /rangeParam = "trend_range"/);
  assert.match(source, /fromParam = "from"/);
  assert.match(source, /toParam = "to"/);
});
