import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

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
