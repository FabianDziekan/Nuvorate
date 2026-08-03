"use client";

import { AnalysisActionForm } from "@/components/dashboard/analysis-action-form";
import type { PlanAnalysisProjection } from "@/lib/analysis-projection";

type AnalysisPreviewCardProps = {
  analysesLimit: number;
  analysesUsed: number;
  analysis: PlanAnalysisProjection | null;
  isLimitReached: boolean;
};

function stringList(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export function AnalysisPreviewCard({
  analysesLimit,
  analysesUsed,
  analysis,
  isLimitReached,
}: AnalysisPreviewCardProps) {
  const isFullAnalysis = analysis?.kind === "full";
  const createdAt =
    analysis?.kind === "full" ? analysis.created_at : analysis?.createdAt;
  const reviewCount =
    analysis?.kind === "full" ? analysis.review_count : analysis?.reviewCount;

  return (
    <article className="relative flex h-[640px] self-start overflow-hidden rounded-[24px] bg-ink p-6 text-white shadow-card">
      <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-brand/25 blur-3xl" />
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="flex shrink-0 items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-white/50">
              Inteligentna analiza
            </p>
            <h2 className="mt-1 text-xl font-semibold">
              Analiza ostatnich 30 dni
            </h2>
            {reviewCount !== undefined && createdAt ? (
              <div className="mt-3 space-y-0.5 text-[10px] leading-4 text-white/45">
                <p>Analiza na podstawie {reviewCount} opinii</p>
                <p>
                  Ostatnia aktualizacja:{" "}
                  {new Date(createdAt).toLocaleDateString("pl-PL")}
                </p>
              </div>
            ) : null}
          </div>
          <span className="shrink-0 rounded-full border border-white/10 bg-brand/20 px-2.5 py-1 text-[10px] font-semibold text-[#C7C8FF]">
            {isFullAnalysis ? "BUSINESS" : "STARTER"}
          </span>
        </div>

        <div className="analysis-scroll-area mt-5 min-h-0 flex-1 overflow-y-auto">
          {analysis?.kind === "basic" ? (
            <div className="space-y-5 pr-2">
              <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border-4 border-brand text-center">
                  <span className="text-xl font-semibold">
                    {analysis.reputationScore}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#B6B7FF]">
                    Reputation Score
                  </p>
                  <p className="mt-1 text-xs leading-5 text-white/50">
                    Wynik reputacji w skali do 100.
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#B6B7FF]">
                  Krótkie podsumowanie
                </p>
                <p className="mt-2 text-sm leading-6 text-white/78">
                  {analysis.summary}
                </p>
              </div>
              {[
                ["Najmocniejsza strona", analysis.strongestStrength],
                ["Najważniejszy problem", analysis.keyProblem],
                ["Wskazówka do działania", analysis.actionTip],
              ].map(([title, content]) => (
                <div
                  key={title}
                  className="border-t border-white/10 pt-5"
                >
                  <p className="text-xs font-semibold text-[#B6B7FF]">
                    {title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/78">
                    {content}
                  </p>
                </div>
              ))}
            </div>
          ) : analysis?.kind === "full" ? (
            <div className="space-y-5 pr-2">
              <div>
                <p className="text-xs font-semibold text-[#B6B7FF]">
                  Podsumowanie
                </p>
                <p className="mt-2 text-sm leading-6 text-white/78">
                  {analysis.summary}
                </p>
              </div>
              {[
                ["Najczęściej chwalone", stringList(analysis.praised_elements)],
                [
                  "Najczęściej zgłaszane problemy",
                  stringList(analysis.reported_problems),
                ],
                ["Rekomendacje działań", stringList(analysis.recommendations)],
              ].map(([title, items]) => (
                <div key={title as string}>
                  <p className="text-xs font-semibold text-[#B6B7FF]">
                    {title as string}
                  </p>
                  {(items as string[]).length > 0 ? (
                    <ul className="mt-2 space-y-1.5 text-xs leading-5 text-white/68">
                      {(items as string[]).map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-xs text-white/45">Brak danych</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm leading-6 text-white/65">
              Wygeneruj analizę, aby poznać wynik reputacji, najmocniejszą stronę
              firmy, główny problem i konkretną wskazówkę do działania.
            </p>
          )}
        </div>

        <div className="sticky bottom-0 mt-5 shrink-0 border-t border-white/10 bg-ink pt-4">
          <AnalysisActionForm
            buttonClassName="w-full rounded-xl bg-brand px-4 py-3 text-xs font-semibold text-white transition hover:bg-[#4D4EE8]"
            hasSummary={Boolean(analysis)}
            isLimitReached={isLimitReached}
            progressVariant="dark"
            redirectTo="/dashboard"
            showLimitDetails={false}
            usageLabel={`Wykorzystano ${analysesUsed} z ${analysesLimit} analiz w tym miesiącu`}
          />
        </div>
      </div>
    </article>
  );
}
