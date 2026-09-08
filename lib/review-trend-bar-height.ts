const ZERO_REVIEW_BAR_HEIGHT = 4;
const MIN_POSITIVE_REVIEW_BAR_HEIGHT = 10;

/**
 * Keeps zero-review days visible without allowing them to impersonate data.
 * Positive values stay proportional to the range maximum; the tiny
 * order-preserving floor only protects very sparse ranges from collapsing.
 */
export function getReviewTrendBarHeight(
  value: number,
  maxValue: number,
  chartHeight: number,
) {
  const safeValue = Number.isFinite(value) ? Math.max(0, value) : 0;
  const safeMaxValue = Number.isFinite(maxValue) ? Math.max(0, maxValue) : 0;
  const safeChartHeight = Math.max(0, chartHeight);

  if (safeValue === 0) return ZERO_REVIEW_BAR_HEIGHT;
  if (safeMaxValue === 0 || safeChartHeight === 0) {
    return MIN_POSITIVE_REVIEW_BAR_HEIGHT;
  }

  const proportionalHeight = Math.round(
    (safeValue / safeMaxValue) * safeChartHeight,
  );
  const lowValueFloor =
    MIN_POSITIVE_REVIEW_BAR_HEIGHT + Math.min(safeValue - 1, 6);

  return Math.min(
    safeChartHeight,
    Math.max(proportionalHeight, lowValueFloor),
  );
}
