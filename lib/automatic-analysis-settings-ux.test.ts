import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const source = readFileSync(
  join(process.cwd(), "components/analysis/automatic-analysis-settings.tsx"),
  "utf8",
);

test("frequency editor closes only when the pointer is outside the whole card", () => {
  assert.match(source, /const cardRef = useRef<HTMLElement>\(null\)/);
  assert.match(source, /<section ref=\{cardRef\}/);
  assert.match(source, /if \(!isEditingFrequency\) return/);
  assert.match(source, /!cardRef\.current\?\.contains\(event\.target\)/);
  assert.match(source, /setIsEditingFrequency\(false\)/);
  assert.match(source, /document\.addEventListener\("pointerdown", handlePointerDown\)/);
});

test("Escape closes the editor and listeners are cleaned up", () => {
  assert.match(source, /event\.key === "Escape"/);
  assert.match(source, /document\.addEventListener\("keydown", handleKeyDown\)/);
  assert.match(source, /document\.removeEventListener\("pointerdown", handlePointerDown\)/);
  assert.match(source, /document\.removeEventListener\("keydown", handleKeyDown\)/);
  assert.match(source, /\}, \[isEditingFrequency\]\)/);
});

test("frequency choices and save action remain unchanged", () => {
  assert.match(source, /\[7, 14, 30\]\.map/);
  assert.match(source, /updateAutomaticAnalysisSettings\(\{/);
  assert.match(source, /onClick=\{\(\) => save\(true, option\)\}/);
});
