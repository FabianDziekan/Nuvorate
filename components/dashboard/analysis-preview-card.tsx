"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
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

type WaveConfig = {
  amplitude: number;
  base: number;
  frequency: number;
  phase: number;
  speed: number;
};

function createWavePath(time: number, config: WaveConfig) {
  const points = Array.from({ length: 15 }, (_, index) => {
    const x = -16 + index * 24;
    const elapsed = time * config.speed;
    const amplitude =
      config.amplitude + Math.sin(elapsed * 0.67 + config.phase) * 2.1;
    const frequency =
      config.frequency + Math.sin(elapsed * 0.31 + config.phase) * 0.004;
    const y =
      config.base +
      amplitude *
        (Math.sin(x * frequency + elapsed + config.phase) +
          0.22 * Math.sin(x * frequency * 2.2 - elapsed * 0.72));

    return { x, y };
  });

  return points.reduce((path, point, index) => {
    if (index === 0) return `M${point.x.toFixed(2)} ${point.y.toFixed(2)}`;

    const previous = points[index - 1];
    const beforePrevious = points[Math.max(0, index - 2)];
    const next = points[Math.min(points.length - 1, index + 1)];
    const controlOne = {
      x: previous.x + (point.x - beforePrevious.x) / 6,
      y: previous.y + (point.y - beforePrevious.y) / 6,
    };
    const controlTwo = {
      x: point.x - (next.x - previous.x) / 6,
      y: point.y - (next.y - previous.y) / 6,
    };

    return `${path}C${controlOne.x.toFixed(2)} ${controlOne.y.toFixed(2)} ${controlTwo.x.toFixed(2)} ${controlTwo.y.toFixed(2)} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
  }, "");
}

function createPrimaryWavePath(time: number) {
  const points = Array.from({ length: 15 }, (_, index) => {
    const x = -16 + index * 24;
    const slowTime = time * 0.00042;
    const shapeTime = time * 0.00073;
    const localAmplitude =
      7.2 +
      Math.sin(slowTime + index * 0.48) * 2.3 +
      Math.sin(shapeTime * 0.56 - index * 0.31) * 1.1;
    const primaryFrequency = 0.031 + Math.sin(slowTime * 0.71) * 0.006;
    const y =
      27 +
      Math.sin(x * primaryFrequency + shapeTime) * localAmplitude +
      Math.sin(x * 0.068 - shapeTime * 0.57) * 3.1 +
      Math.sin(x * 0.017 + slowTime * 1.4) * 1.6;

    return { x, y };
  });

  return points.reduce((path, point, index) => {
    if (index === 0) return `M${point.x.toFixed(2)} ${point.y.toFixed(2)}`;

    const previous = points[index - 1];
    const beforePrevious = points[Math.max(0, index - 2)];
    const next = points[Math.min(points.length - 1, index + 1)];
    const controlOne = {
      x: previous.x + (point.x - beforePrevious.x) / 6,
      y: previous.y + (point.y - beforePrevious.y) / 6,
    };
    const controlTwo = {
      x: point.x - (next.x - previous.x) / 6,
      y: point.y - (next.y - previous.y) / 6,
    };

    return `${path}C${controlOne.x.toFixed(2)} ${controlOne.y.toFixed(2)} ${controlTwo.x.toFixed(2)} ${controlTwo.y.toFixed(2)} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
  }, "");
}

function LiveAnalysisWaves() {
  const primaryWaveRef = useRef<SVGPathElement>(null);
  const firstWaveRef = useRef<SVGPathElement>(null);
  const secondWaveRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const mobileMedia = window.matchMedia("(max-width: 768px)");
    const reducedMotionMedia = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    if (!mobileMedia.matches || reducedMotionMedia.matches) return;

    let frameId = 0;
    const render = (time: number) => {
      primaryWaveRef.current?.setAttribute("d", createPrimaryWavePath(time));
      firstWaveRef.current?.setAttribute(
        "d",
        createWavePath(time, {
          amplitude: 5.8,
          base: 29,
          frequency: 0.034,
          phase: 0.4,
          speed: 0.00068,
        }),
      );
      secondWaveRef.current?.setAttribute(
        "d",
        createWavePath(time, {
          amplitude: 5.1,
          base: 35,
          frequency: 0.041,
          phase: 2.2,
          speed: 0.00056,
        }),
      );
      frameId = window.requestAnimationFrame(render);
    };

    frameId = window.requestAnimationFrame(render);

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  return (
    <>
      <path
        ref={primaryWaveRef}
        d={createPrimaryWavePath(0)}
        stroke="rgba(199,200,255,0.82)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        ref={firstWaveRef}
        d={createWavePath(0, {
          amplitude: 5.8,
          base: 29,
          frequency: 0.034,
          phase: 0.4,
          speed: 0.00068,
        })}
        stroke="rgba(255,255,255,0.24)"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <path
        ref={secondWaveRef}
        d={createWavePath(0, {
          amplitude: 5.1,
          base: 35,
          frequency: 0.041,
          phase: 2.2,
          speed: 0.00056,
        })}
        stroke="rgba(199,200,255,0.38)"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </>
  );
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

  return (
    <>
      <Link
        href="/analysis"
        className="relative flex h-[240px] self-start overflow-hidden rounded-[24px] bg-ink p-4 text-white shadow-card outline-none transition focus-visible:ring-4 focus-visible:ring-brand/40 min-[769px]:hidden"
      >
        <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-brand/30 blur-3xl" />
        <div className="relative flex w-full flex-col">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-white/50">
                Inteligentna analiza
              </p>
              <h2 className="mt-1 text-xl font-semibold">
                Analiza ostatnich 30 dni
              </h2>
              <p className="mt-1 text-[10px] leading-4 text-white/45">
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
          <div className="relative mt-3 h-12 overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(ellipse_at_16%_110%,rgba(91,92,246,0.7),transparent_42%),linear-gradient(110deg,rgba(255,255,255,0.09),rgba(255,255,255,0.02))]">
            <svg
              aria-hidden="true"
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 300 48"
              fill="none"
              preserveAspectRatio="none"
            >
              <LiveAnalysisWaves />
            </svg>
          </div>
          <div className="mt-2">
            <p className="text-[10px] font-semibold text-[#C7C8FF]">
              Najczęściej chwalone
            </p>
            <ul className="mt-1 space-y-0.5 text-[10px] leading-3 text-white/65">
              {praisedPreview.slice(0, 2).map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
          <span className="mt-auto inline-flex items-center border-t border-white/10 pt-2 text-xs font-semibold text-[#C7C8FF]">
            Zobacz pełny raport <span aria-hidden="true">→</span>
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
