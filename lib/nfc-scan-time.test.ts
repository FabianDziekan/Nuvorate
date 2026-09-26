import assert from "node:assert/strict";
import test from "node:test";

import { formatNfcScanTime } from "./nfc-scan-time.ts";

test("summer scan time uses Warsaw UTC+2 without changing the stored instant", () => {
  const scannedAt = "2026-09-26T11:48:00Z";
  assert.equal(formatNfcScanTime(scannedAt, new Date("2026-09-26T11:50:00Z")), "Dzisiaj, 13:48");
  assert.equal(scannedAt, "2026-09-26T11:48:00Z");
});

test("winter scan time uses Warsaw UTC+1", () => {
  assert.equal(formatNfcScanTime("2026-01-15T12:48:00Z", new Date("2026-01-15T13:00:00Z")), "Dzisiaj, 13:48");
});

test("today and yesterday follow Warsaw midnight rather than UTC midnight", () => {
  const now = new Date("2026-09-25T22:30:00Z"); // 26 Sep, 00:30 in Warsaw
  assert.equal(formatNfcScanTime("2026-09-25T22:05:00Z", now), "Dzisiaj, 00:05");
  assert.equal(formatNfcScanTime("2026-09-25T21:55:00Z", now), "Wczoraj, 23:55");
});

test("older scans show a Warsaw-local date and daylight saving transitions remain calendar-based", () => {
  const now = new Date("2026-10-26T12:00:00Z");
  assert.equal(formatNfcScanTime("2026-10-23T22:30:00Z", now), "24 paź 2026, 00:30");
  assert.equal(formatNfcScanTime("2026-10-25T01:30:00Z", now), "Wczoraj, 02:30");
});

test("missing or invalid scan timestamps keep the empty-state label", () => {
  assert.equal(formatNfcScanTime(), "Brak skanów");
  assert.equal(formatNfcScanTime("invalid"), "Brak skanów");
});
