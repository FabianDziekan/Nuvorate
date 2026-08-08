"use client";

import { useState } from "react";
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
  return (
    <section className="mt-6 -mx-1 w-[calc(100%+8px)] overflow-hidden rounded-[24px] border border-black/[0.06] bg-white py-3 shadow-card">
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
        className="mt-4 flex snap-x snap-mandatory gap-3.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onScroll={(event) => {
          const cardStep = event.currentTarget.clientWidth - 28 + 14;
          const nextIndex = Math.round(event.currentTarget.scrollLeft / cardStep);
          setActiveIndex(Math.min(2, Math.max(0, nextIndex)));
        }}
      >
        <article className="h-[148px] min-w-[calc(100%-28px)] snap-start rounded-2xl border border-black/[0.06] bg-white p-4 shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-black/35">
            {bestDay.title}
          </p>
          <p className="mt-3 text-lg font-semibold tracking-tight">{bestDay.label}</p>
          {bestDay.value ? (
            <p className="mt-0.5 text-sm font-semibold text-brand">{bestDay.value}</p>
          ) : null}
          <p className="mt-2 text-xs leading-5 text-black/45">{bestDay.detail}</p>
        </article>

        <article className="h-[148px] min-w-[calc(100%-28px)] snap-start rounded-2xl border border-black/[0.06] bg-white p-4 shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-black/35">Ten miesiąc</p>
          <p className="mt-3 text-lg font-semibold tracking-tight">{currentMonth.value}</p>
          <p className="mt-2 flex items-center gap-2 text-xs leading-5 text-black/45">
            <span className={`h-2 w-2 rounded-full ${currentMonth.marker}`} />
            {currentMonth.helperText}
          </p>
        </article>

        <div className="min-w-[calc(100%-28px)] snap-start">
          <MonthlyGoalCard
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
