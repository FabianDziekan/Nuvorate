type MobileTrendPoint = {
  averageRating: number | null;
  label: string;
  tooltipLabel: string;
  value: number;
};

function formatReviewCount(value: number) {
  return `${value} ${value === 1 ? "opinia" : "opinii"}`;
}

function formatAverageRating(value: number | null) {
  if (value === null || !Number.isFinite(value)) return "Brak oceny";

  return `Średnia ocena: ${value.toLocaleString("pl-PL", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}`;
}

function getVisibleLabels(points: MobileTrendPoint[]) {
  if (points.length <= 4) return points.map((point) => point.label);

  return [0, 1, 2, 3].map((index) => {
    const pointIndex = Math.round((index * (points.length - 1)) / 3);
    return points[pointIndex]?.label ?? "";
  });
}

export function MobileTrendChart({ points }: { points: MobileTrendPoint[] }) {
  const chartBottom = 125;
  const chartTop = 18;
  const chartHeight = chartBottom - chartTop;
  const chartContainerHeight = 144;
  const barWidth = Math.max(6, Math.min(10, Math.floor(256 / points.length)));
  const labels = getVisibleLabels(points);
  const maxValue = Math.max(...points.map((point) => point.value), 0);

  if (points.length === 0) {
    return (
      <div className="mt-4 grid h-[190px] place-items-center rounded-2xl border border-dashed border-black/[0.08] bg-[#FAFAFC] px-5 text-center">
        <p className="max-w-sm text-sm font-semibold leading-6 text-black/45">
          Brak opinii w wybranym okresie
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="relative h-[144px] w-full overflow-visible">
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
          viewBox="0 0 320 144"
          preserveAspectRatio="none"
          role="img"
          aria-label="Liczba nowych opinii w wybranym okresie"
        >
          {[54, 90].map((y) => (
            <line
              key={y}
              x1="6"
              y1={y}
              x2="314"
              y2={y}
              stroke="#0F0F10"
              strokeOpacity=".045"
              strokeDasharray="3 8"
            />
          ))}
          <line x1="6" y1={chartBottom} x2="314" y2={chartBottom} stroke="#0F0F10" strokeOpacity=".12" />
        </svg>

        {points.map((point, index) => {
          const visibleHeight =
            point.value === 0
              ? 4
              : Math.max(10, (point.value / maxValue) * chartHeight);
          const leftPercent = ((index + 0.5) / points.length) * 100;
          const tooltipEdgeClass =
            index < 5
              ? "left-0"
              : index > points.length - 6
                ? "right-0"
                : "left-1/2 -translate-x-1/2";
          const barClassName =
            point.value > 0
              ? "bg-brand opacity-[0.86]"
              : "bg-[#D1D5DB] dark:bg-[#4B5563]";

          return (
            <div
              key={`${point.tooltipLabel}-${index}`}
              className="group absolute z-10 outline-none hover:z-50 focus:z-50"
              style={{
                bottom: `${chartContainerHeight - chartBottom}px`,
                height: `${chartHeight}px`,
                left: `${leftPercent}%`,
                transform: "translateX(-50%)",
                width: `${Math.max(barWidth, 14)}px`,
              }}
              tabIndex={0}
            >
              <div
                className={`absolute bottom-0 left-1/2 rounded-t-[4px] transition-colors duration-200 ${barClassName}`}
                style={{
                  height: `${visibleHeight}px`,
                  transform: "translateX(-50%)",
                  width: `${barWidth}px`,
                }}
              />
              <div
                className={`pointer-events-none absolute z-[999] min-w-[150px] max-w-[220px] rounded-xl border border-white/[0.08] bg-[#181822] px-3.5 py-3 text-left opacity-0 shadow-[0_18px_40px_rgba(15,15,16,0.22)] transition-opacity duration-150 group-hover:opacity-100 group-focus:opacity-100 ${tooltipEdgeClass}`}
                style={{ bottom: `${visibleHeight + 14}px` }}
              >
                <p className="text-[13px] font-semibold leading-[1.4] text-white/95">{point.tooltipLabel}</p>
                <p className="mt-1 text-[13px] font-medium leading-[1.4] text-white/80">{formatReviewCount(point.value)}</p>
                <p className="mt-1 text-xs leading-[1.4] text-white/55">{formatAverageRating(point.averageRating)}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-1 grid grid-cols-4 text-[10px] font-medium text-black/35">
        {labels.map((label, index) => (
          <span key={`${label}-${index}`} className={index === 0 ? "text-left" : index === labels.length - 1 ? "text-right" : "text-center"}>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
