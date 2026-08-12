"use client";

import { useEffect, useState } from "react";
import { AnalysisSectionIcon } from "@/components/analysis/analysis-section-icon";

type AnalysisSection = {
  eyebrow: string;
  icon: "analysis" | "check" | "warning";
  items: string[];
  title: string;
  tone: "strengths" | "problems" | "recommendations";
};

type MobileAnalysisSectionCardsProps = {
  sections: AnalysisSection[];
};

const toneStyles = {
  strengths: {
    icon: "bg-emerald-50 text-emerald-700",
    marker: "bg-emerald-500",
  },
  problems: {
    icon: "bg-red-50 text-red-600",
    marker: "bg-red-500",
  },
  recommendations: {
    icon: "bg-brand-soft text-brand",
    marker: "bg-brand",
  },
};

export function MobileAnalysisSectionCards({
  sections,
}: MobileAnalysisSectionCardsProps) {
  const [selectedSection, setSelectedSection] = useState<AnalysisSection | null>(null);

  useEffect(() => {
    if (!selectedSection) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedSection(null);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedSection]);

  return (
    <>
      <section className="mt-4 grid gap-3 min-[769px]:hidden" aria-label="Szczegóły analizy">
        {sections.map((section) => {
          const style = toneStyles[section.tone];

          return (
            <button
              key={section.title}
              type="button"
              onClick={() => setSelectedSection(section)}
              className="flex w-full items-center gap-3 rounded-[22px] border border-black/[0.06] bg-white p-4 text-left shadow-card transition hover:border-brand/25 focus:outline-none focus:ring-4 focus:ring-brand/10"
              >
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${style.icon}`}>
                <AnalysisSectionIcon name={section.icon} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-black/30">
                  {section.eyebrow}
                </span>
                <span className="mt-1 block text-base font-semibold text-ink">
                  {section.title}
                </span>
                <span className="mt-1 block truncate text-xs text-black/45">
                  {section.items.length} {section.items.length === 1 ? "element" : "elementów"}
                </span>
              </span>
              <span className="text-lg font-medium text-brand" aria-hidden="true">→</span>
            </button>
          );
        })}
      </section>

      {selectedSection ? (
        <div
          className="fixed inset-0 z-[80] grid place-items-center bg-ink/35 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) {
              setSelectedSection(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="analysis-section-dialog-title"
            className="analysis-context-alert-enter flex max-h-[min(620px,calc(100vh-32px))] w-full max-w-md flex-col overflow-hidden rounded-[28px] border border-black/[0.06] bg-white p-5 shadow-[0_28px_90px_rgba(15,15,16,0.28)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${toneStyles[selectedSection.tone].icon}`}>
                  <AnalysisSectionIcon name={selectedSection.icon} />
                </span>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-black/30">
                    {selectedSection.eyebrow}
                  </p>
                  <h2 id="analysis-section-dialog-title" className="mt-1 text-xl font-semibold tracking-tight">
                    {selectedSection.title}
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSection(null)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-lg text-black/45 transition hover:bg-black/[0.04] hover:text-ink focus:outline-none focus:ring-4 focus:ring-brand/10"
                aria-label="Zamknij"
              >
                ×
              </button>
            </div>

            <ul className="analysis-scroll-area mt-5 min-h-0 space-y-3 overflow-y-auto pb-2 pr-2">
              {selectedSection.items.map((item) => (
                <li key={item} className="flex gap-3 rounded-2xl border border-black/[0.04] bg-[#FAFAFC] p-4 text-sm leading-6 text-black/60 shadow-sm">
                  <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${toneStyles[selectedSection.tone].marker}`} />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>
      ) : null}
    </>
  );
}
