"use client";

import Link from "next/link";
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

function toMobileSignal(value: string, type: "praise" | "problem") {
  let signal = value.trim().split(/[.!?]/)[0]?.trim() ?? "";

  if (type === "praise") {
    signal = signal
      .replace(
        /^(?:klienci|goście)(?:\s+(?:często|najczęściej|bardzo|wyraźnie))*\s+(?:chwalą|doceniają|pozytywnie oceniają|wskazują na)\s+/i,
        "",
      )
      .replace(/^(?:często|najczęściej)\s+(?:doceniane|chwalone)\s+(?:są|jest)\s+/i, "");
  } else {
    signal = signal
      .replace(/^(?:najczęściej powtarzającym się|głównym|najważniejszym) problemem jest\s+/i, "")
      .replace(/^(?:w (?:kilku|części|wielu|niektórych) opiniach )?(?:powtarzają się |pojawiają się )?(?:uwagi|zastrzeżenia) (?:dotyczące|na temat)\s+/i, "");
  }

  signal = signal
    .replace(/\s+(?:na miejscu|w lokalu|przez klientów|w opiniach)$/i, "")
    .split(/[,:;]/)[0]
    .trim()
    .replace(/[.!?]+$/, "");

  if (signal.length > 64) {
    signal = signal.split(/\s+/).slice(0, 7).join(" ");
  }

  return signal ? `${signal.charAt(0).toUpperCase()}${signal.slice(1)}` : "Brak danych do wyświetlenia";
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
  const praisedPreview =
    analysis?.kind === "full"
      ? stringList(analysis.praised_elements).slice(0, 2)
      : analysis?.kind === "basic"
        ? [analysis.strongestStrength]
        : [];
  const mainProblem =
    analysis?.kind === "full"
      ? stringList(analysis.reported_problems)[0]
      : analysis?.kind === "basic"
        ? analysis.keyProblem
        : null;
  const reputationScore =
    analysis?.kind === "full"
      ? analysis.score
      : analysis?.kind === "basic"
        ? analysis.reputationScore
        : null;
  const reputationLabel =
    reputationScore === null || reputationScore === undefined
      ? "Wygeneruj analizę, aby poznać wynik"
      : reputationScore >= 80
        ? "Bardzo dobra reputacja"
        : reputationScore >= 60
          ? "Dobra reputacja"
          : reputationScore >= 40
            ? "Reputacja wymaga poprawy"
            : "Reputacja wymaga uwagi";

  return (
    <>
      <Link
        href="/analysis"
        className="relative flex min-h-[286px] self-start overflow-hidden rounded-[24px] bg-ink p-5 text-white shadow-card outline-none transition focus-visible:ring-4 focus-visible:ring-brand/40 min-[769px]:hidden"
      >
        <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-brand/30 blur-3xl" />
        <div className="relative flex w-full flex-col">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-white/50">
                Inteligentna analiza
              </p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight">
                Analiza ostatnich 30 dni
              </h2>
              <p className="mt-1 text-[11px] leading-4 text-white/45">
                {reviewCount ?? 0} opinii • Aktualizacja{" "}
                {createdAt
                  ? new Date(createdAt).toLocaleDateString("pl-PL")
                  : "—"}
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-white/10 bg-brand/20 px-2.5 py-1 text-[10px] font-semibold text-[#C7C8FF]">
              {isFullAnalysis ? "BUSINESS" : "STARTER"}
            </span>
          </div>
          <div className="mt-5 border-y border-white/10 py-3.5">
            <div>
              <p className="text-[32px] font-semibold leading-none tracking-[-0.055em]">
                {reputationScore ?? "—"}
                {reputationScore !== null && reputationScore !== undefined ? (
                  <span className="ml-1 text-sm font-medium tracking-normal text-white/45">/ 100</span>
                ) : null}
              </p>
              <p className="mt-1.5 text-xs leading-5 text-[#C7C8FF]">
                {reputationLabel}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-semibold text-[#C7C8FF]">
              Najczęściej chwalone
            </p>
            <ul className="mt-1.5 space-y-1 text-xs leading-[1.45] text-white/70">
              {praisedPreview.slice(0, 2).map((item) => (
                <li key={item}>• {toMobileSignal(item, "praise")}</li>
              ))}
              {praisedPreview.length === 0 ? (
                <li className="text-white/45">• Brak danych do wyświetlenia</li>
              ) : null}
            </ul>
          </div>
          <div className="mt-4 border-t border-white/10 pt-3">
            <p className="text-[11px] font-semibold text-[#C7C8FF]">
              Najważniejszy problem
            </p>
            <p className="mt-1 text-xs leading-[1.45] text-white/70">
              • {mainProblem ? toMobileSignal(mainProblem, "problem") : "Brak danych do wyświetlenia"}
            </p>
          </div>
          <span className="mt-auto inline-flex items-center pt-4 text-sm font-semibold text-[#C7C8FF]">
            Zobacz pełną analizę <span className="ml-1" aria-hidden="true">→</span>
          </span>
        </div>
      </Link>

    <article className="relative hidden h-[640px] self-start overflow-hidden rounded-[24px] bg-ink p-6 text-white shadow-card min-[769px]:flex">
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

        <div className="analysis-scroll-area dashboard-analysis-scroll-area mt-5 min-h-0 flex-1 overflow-y-auto pb-2 pr-2 max-[768px]:mt-3">
          {analysis?.kind === "basic" ? (
            <div className="space-y-5">
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
            <div className="space-y-5">
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

        <div className="sticky bottom-0 mt-5 shrink-0 border-t border-white/10 bg-ink pt-4 max-[768px]:mt-3 max-[768px]:pt-3">
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
    </>
  );
}
