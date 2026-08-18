"use client";

import { useEffect, useRef, useState } from "react";

type MetricIcon = "nfc" | "reviews" | "star" | "trend";

export type MobileMetric = {
  label: string;
  value: string;
  change: string;
  detail: string;
  icon: MetricIcon;
};

function MetricIcon({ name, className = "h-4 w-4" }: { name: MetricIcon; className?: string }) {
  const paths: Record<MetricIcon, React.ReactNode> = {
    nfc: (
      <>
        <path d="M3.5 9a12 12 0 0 1 17 0" />
        <path d="M6.75 12.5a7.5 7.5 0 0 1 10.5 0" />
        <path d="M10 16a3 3 0 0 1 4 0" />
      </>
    ),
    reviews: (
      <>
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
        <path d="M8 9h8" />
        <path d="M8 13h5" />
      </>
    ),
    star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />,
    trend: (
      <>
        <path d="m4 17 6-6 4 4 6-8" />
        <path d="M15 7h5v5" />
      </>
    ),
  };

  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

export function MobileMetricCards({ metrics }: { metrics: MobileMetric[] }) {
  const [selectedMetric, setSelectedMetric] = useState<MobileMetric | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!selectedMetric) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedMetric(null);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedMetric]);

  return (
    <>
      <section className="mt-5 -mx-[5px] grid grid-cols-4 gap-3 min-[769px]:hidden" aria-label="Najważniejsze statystyki">
        {metrics.map((metric) => (
          <button
            key={metric.label}
            type="button"
            aria-haspopup="dialog"
            aria-label={`Pokaż szczegóły: ${metric.label}`}
            className="h-[106px] rounded-[22px] border border-black/[0.06] bg-white px-2 py-3 text-left shadow-card transition-transform duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            onClick={() => setSelectedMetric(metric)}
          >
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-brand-soft text-brand">
              <MetricIcon name={metric.icon} className="h-3.5 w-3.5" />
            </span>
            <span className="mt-2 flex min-h-[18px] items-start text-[9px] font-medium leading-[9px] text-black/40">{metric.label}</span>
            <span className="mt-1.5 block text-[26px] font-semibold leading-none tracking-[-0.04em] text-ink">{metric.value}</span>
          </button>
        ))}
      </section>

      {selectedMetric ? (
        <div
          className="fixed inset-0 z-[70] grid place-items-center bg-ink/35 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedMetric(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-metric-title"
            className="w-full max-w-sm animate-[mobile-metric-modal-in_180ms_ease-out] rounded-[24px] border border-black/[0.06] bg-white p-5 shadow-[0_24px_70px_rgba(15,15,16,0.22)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-brand">
                  <MetricIcon name={selectedMetric.icon} className="h-5 w-5" />
                </span>
                <p id="mobile-metric-title" className="text-base font-semibold tracking-[-0.02em] text-ink">{selectedMetric.label}</p>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                aria-label="Zamknij szczegóły"
                className="grid h-9 w-9 place-items-center rounded-xl border border-black/[0.08] text-black/45 transition-colors hover:bg-black/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                onClick={() => setSelectedMetric(null)}
              >
                <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            </div>

            <p className="mt-7 text-5xl font-semibold tracking-[-0.05em] text-ink">{selectedMetric.value}</p>
            <div className="mt-6 space-y-3 border-t border-black/[0.07] pt-5 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-black/45">Okres</span>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">{selectedMetric.change}</span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="shrink-0 text-black/45">Szczegóły</span>
                <span className="text-right leading-5 text-ink/75">{selectedMetric.detail}</span>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
