import assert from "node:assert/strict";
import test from "node:test";

import { getReviewTrendBarHeight } from "./review-trend-bar-height.ts";

const CHART_HEIGHT = 156;

test("zero-review days stay as a subtle baseline marker", () => {
  assert.equal(getReviewTrendBarHeight(0, 0, CHART_HEIGHT), 4);
  assert.equal(getReviewTrendBarHeight(0, 2, CHART_HEIGHT), 4);
});

test("a one-review day is clearly taller than zero when one is the maximum", () => {
  assert.equal(getReviewTrendBarHeight(1, 1, CHART_HEIGHT), CHART_HEIGHT);
  assert.ok(getReviewTrendBarHeight(1, 1, CHART_HEIGHT) > 4);
});

test("one and two reviews retain a proportional visual difference", () => {
  assert.equal(getReviewTrendBarHeight(1, 2, CHART_HEIGHT), 78);
  assert.equal(getReviewTrendBarHeight(2, 2, CHART_HEIGHT), 156);
});

test("sparse values remain ordered even when a single day has a large maximum", () => {
  const zero = getReviewTrendBarHeight(0, 100, CHART_HEIGHT);
  const one = getReviewTrendBarHeight(1, 100, CHART_HEIGHT);
  const two = getReviewTrendBarHeight(2, 100, CHART_HEIGHT);
  const maximum = getReviewTrendBarHeight(100, 100, CHART_HEIGHT);

  assert.ok(zero < one);
  assert.ok(one < two);
  assert.equal(maximum, CHART_HEIGHT);
});
