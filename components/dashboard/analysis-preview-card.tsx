"use client";

import { AnalysisActionForm } from "@/components/dashboard/analysis-action-form";

type AnalysisPreviewCardProps = {
  createdAt?: string;
  praisedElements: string[];
  recommendations: string[];
  reportedProblems: string[];
  reviewCount?: number;
  summary?: string;
};

export function AnalysisPreviewCard({
  createdAt,
  praisedElements,
  recommendations,
  reportedProblems,
  reviewCount,
  summary,
}: AnalysisPreviewCardProps) {
  return (
    <article className="relative flex h-[640px] self-start overflow-hidden rounded-[24px] bg-ink p-6 text-white shadow-card">
      <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-brand/25 blur-3xl" />
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="flex shrink-0 items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-white/40">
              Inteligentna analiza
            </p>
            <h2 className="mt-1 text-xl font-semibold">
              Analiza ostatnich 30 dni
            </h2>
            {reviewCount !== undefined && createdAt && (
              <div className="mt-3 space-y-0.5 text-[10px] leading-4 text-white/35">
                <p>Analiza na podstawie {reviewCount} opinii</p>
                <p>
                  Ostatnia aktualizacja:{" "}
                  {new Date(createdAt).toLocaleDateString("pl-PL")}
                </p>
              </div>
            )}
          </div>
          <span className="shrink-0 rounded-full bg-brand/20 px-2.5 py-1 text-[10px] font-semibold text-[#B6B7FF]">
            BUSINESS
          </span>
        </div>

        <div className="analysis-scroll-area mt-5 min-h-0 flex-1 overflow-y-auto">
          {summary ? (
            <div className="space-y-5 pr-2">
              <div>
                <p className="text-xs font-semibold text-[#B6B7FF]">
                  Podsumowanie
                </p>
                <p className="mt-2 text-sm leading-6 text-white/70">
                  {summary}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-[#B6B7FF]">
                  Najczęściej chwalone
                </p>
                {praisedElements.length > 0 ? (
                  <ul className="mt-2 space-y-1.5 text-xs leading-5 text-white/60">
                    {praisedElements.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-xs text-white/45">Brak danych</p>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold text-[#B6B7FF]">
                  Najczęściej zgłaszane problemy
                </p>
                {reportedProblems.length > 0 ? (
                  <ul className="mt-2 space-y-1.5 text-xs leading-5 text-white/60">
                    {reportedProblems.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-xs text-white/45">Brak danych</p>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold text-[#B6B7FF]">
                  Rekomendacje działań
                </p>
                {recommendations.length > 0 ? (
                  <ul className="mt-2 space-y-1.5 text-xs leading-5 text-white/60">
                    {recommendations.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-xs text-white/45">Brak danych</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm leading-6 text-white/65">
              Wygeneruj pierwszą analizę opinii z ostatnich 30 dni.
            </p>
          )}
        </div>

        <div className="sticky bottom-0 mt-5 shrink-0 border-t border-white/10 bg-ink pt-4">
          <AnalysisActionForm
            buttonClassName="w-full rounded-xl bg-brand px-4 py-3 text-xs font-semibold text-white transition hover:bg-[#4D4EE8]"
            hasSummary={Boolean(summary)}
            progressVariant="dark"
            redirectTo="/dashboard"
          />
        </div>
      </div>
    </article>
  );
}
