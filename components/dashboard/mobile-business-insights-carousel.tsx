"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MonthlyGoalCard } from "@/components/dashboard/monthly-goal-card";

type MobileBusinessInsightsCarouselProps = {
  bestDay: {
    detail: string;
    label: string;
    title: string;
    value: string;
  };
  currentMonth: {
    helperText: string;
    marker: string;
    value: string;
  };
  monthlyGoal: {
    count: number;
    goal: number;
    helperText: string;
    progress: number;
    reached: boolean;
  };
};

export function MobileBusinessInsightsCarousel({
  bestDay,
  currentMonth,
  monthlyGoal,
}: MobileBusinessInsightsCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const activeIndexRef = useRef(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const frameRef = useRef<number | null>(null);

  const updateActiveIndex = useCallback((carousel: HTMLDivElement) => {
    const carouselCenter =
      carousel.getBoundingClientRect().left + carousel.clientWidth / 2;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    cardRefs.current.forEach((card, index) => {
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const distance = Math.abs(rect.left + rect.width / 2 - carouselCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    if (activeIndexRef.current === closestIndex) {
      return;
    }

    activeIndexRef.current = closestIndex;
    setActiveIndex(closestIndex);
  }, []);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const refreshActiveCard = () => updateActiveIndex(carousel);
    refreshActiveCard();
    window.addEventListener("resize", refreshActiveCard);

    return () => {
      window.removeEventListener("resize", refreshActiveCard);
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [updateActiveIndex]);

  function handleScroll() {
    const carousel = carouselRef.current;
    if (!carousel || frameRef.current !== null) return;

    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;
      updateActiveIndex(carousel);
    });
  }

  const cardStyle = {
    minWidth: "min(360px, calc(100vw - 32px))",
    width: "min(360px, calc(100vw - 32px))",
  };
  const carouselStyle = {
    paddingInline:
      "max(4px, calc((100% - min(360px, calc(100vw - 32px))) / 2))",
    scrollPaddingInline:
      "max(4px, calc((100% - min(360px, calc(100vw - 32px))) / 2))",
  };

  return (
    <section className="mt-6 -mx-1 w-[calc(100%+8px)] overflow-hidden rounded-[24px] border border-black/[0.06] bg-white py-3 shadow-card lg:hidden">
      <div className="flex items-start justify-between gap-3 px-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-black/35">
            Business Insights
          </p>
          <p className="mt-1 text-xs leading-4 text-black/45">
            Krótkie sygnały z opinii dla planu Business.
          </p>
        </div>
        <span className="mt-0.5 shrink-0 rounded-full bg-brand-soft px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-brand">
          Business
        </span>
      </div>

      <div
        ref={carouselRef}
        className={`mt-4 flex items-start gap-3.5 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
          isEditingGoal
            ? "overflow-x-hidden touch-pan-y"
            : "snap-x snap-mandatory overflow-x-auto"
        }`}
        style={carouselStyle}
        onScroll={handleScroll}
      >
        <article
          ref={(element) => {
            cardRefs.current[0] = element;
          }}
          style={cardStyle}
          className="h-[148px] shrink-0 snap-center snap-always rounded-2xl border border-black/[0.06] bg-white p-4 shadow-sm"
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-black/35">
            {bestDay.title}
          </p>
          <p className="mt-3 text-lg font-semibold tracking-tight">{bestDay.label}</p>
          {bestDay.value ? (
            <p className="mt-0.5 text-sm font-semibold text-brand">{bestDay.value}</p>
          ) : null}
          <p className="mt-2 text-xs leading-5 text-black/45">{bestDay.detail}</p>
        </article>

        <article
          ref={(element) => {
            cardRefs.current[1] = element;
          }}
          style={cardStyle}
          className="h-[148px] shrink-0 snap-center snap-always rounded-2xl border border-black/[0.06] bg-white p-4 shadow-sm"
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-black/35">Ten miesiąc</p>
          <p className="mt-3 text-lg font-semibold tracking-tight">{currentMonth.value}</p>
          <p className="mt-2 flex items-center gap-2 text-xs leading-5 text-black/45">
            <span className={`h-2 w-2 rounded-full ${currentMonth.marker}`} />
            {currentMonth.helperText}
          </p>
        </article>

        <div
          ref={(element) => {
            cardRefs.current[2] = element;
          }}
          style={cardStyle}
          className={`${isEditingGoal ? "min-h-[224px]" : "h-[148px]"} shrink-0 snap-center snap-always`}
        >
          <MonthlyGoalCard
            carousel
            onEditingChange={setIsEditingGoal}
            count={monthlyGoal.count}
            goal={monthlyGoal.goal}
            helperText={monthlyGoal.helperText}
            progress={monthlyGoal.progress}
            reached={monthlyGoal.reached}
          />
        </div>
      </div>

      <div className="mt-3 flex justify-center gap-1.5" aria-label={`Karta ${activeIndex + 1} z 3`}>
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className={`h-1.5 rounded-full transition-all duration-200 ${
              activeIndex === index ? "w-3 bg-brand" : "w-1.5 bg-black/15"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
