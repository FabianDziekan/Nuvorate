import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckoutActivationStatus } from "@/components/billing/checkout-activation-status";
import { PlanPicker } from "@/components/billing/plan-picker";
import { BrandLogo } from "@/components/brand/logo";
import { AnalysisPreviewCard } from "@/components/dashboard/analysis-preview-card";
import { GoogleSyncButton } from "@/components/dashboard/google-sync-button";
import { MonthlyGoalCard } from "@/components/dashboard/monthly-goal-card";
import { ReviewResponseForm } from "@/components/dashboard/review-response-form";
import {
  TrendRangeSelect,
  type TrendRange,
} from "@/components/dashboard/trend-range-select";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { NotificationSidebarBadge } from "@/components/notifications/notification-sidebar-badge";
import {
  currentPeriodMonth,
  getAiLimit,
  getPlanLabel,
  isPaidPlan,
  normalizePlan,
  type AppPlan,
} from "@/lib/plans";
import { hasPriceIdForPlan } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";

export const metadata: Metadata = {
  title: "Dashboard | NuvoRate",
};

type DashboardIcon =
  | "analysis"
  | "bell"
  | "dashboard"
  | "logout"
  | "nfc"
  | "responses"
  | "reviews"
  | "settings"
  | "verification"
  | "star"
  | "trend";

function Icon({
  name,
  className = "h-5 w-5",
}: {
  name: DashboardIcon;
  className?: string;
}) {
  const paths: Record<DashboardIcon, React.ReactNode> = {
    analysis: (
      <>
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <path d="m7 15 4-4 3 2 5-7" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </>
    ),
    logout: (
      <>
        <path d="M10 17l5-5-5-5" />
        <path d="M15 12H3" />
        <path d="M14 3h4a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-4" />
      </>
    ),
    nfc: (
      <>
        <path d="M8.5 8.5a5 5 0 0 1 0 7" />
        <path d="M5.5 5.5a9 9 0 0 1 0 13" />
        <path d="M15.5 8.5a5 5 0 0 0 0 7" />
        <path d="M18.5 5.5a9 9 0 0 0 0 13" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
      </>
    ),
    responses: (
      <>
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
        <path d="m8 10 2 2 4-4" />
        <path d="M8 15h7" />
      </>
    ),
    reviews: (
      <>
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
        <path d="M8 9h8" />
        <path d="M8 13h5" />
      </>
    ),
    verification: (
      <>
        <path d="M12 3 5 6v5c0 4.4 2.9 8.4 7 10 4.1-1.6 7-5.6 7-10V6l-7-3Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a2 2 0 0 0 .4 2.2l.1.1-2.6 2.6-.1-.1a2 2 0 0 0-2.2-.4 2 2 0 0 0-1.2 1.8V21h-3.6v-.2A2 2 0 0 0 9 19a2 2 0 0 0-2.2.4l-.1.1-2.6-2.6.1-.1A2 2 0 0 0 4.6 15a2 2 0 0 0-1.8-1.2H3v-3.6h.2A2 2 0 0 0 5 9a2 2 0 0 0-.4-2.2l-.1-.1 2.6-2.6.1.1A2 2 0 0 0 9 4.6a2 2 0 0 0 1.2-1.8V3h3.6v.2A2 2 0 0 0 15 5a2 2 0 0 0 2.2-.4l.1-.1 2.6 2.6-.1.1A2 2 0 0 0 19.4 9a2 2 0 0 0 1.8 1.2h.2v3.6h-.2A2 2 0 0 0 19.4 15Z" />
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
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

const navigation = [
  { label: "Pulpit", icon: "dashboard" as const, active: true },
  { label: "Opinie", icon: "reviews" as const },
  { label: "Analiza", icon: "analysis" as const, href: "/analysis" },
  { label: "Odpowiedzi", icon: "responses" as const, href: "/responses" },
  {
    label: "Weryfikacja autora",
    icon: "verification" as const,
    href: "/author-verification",
  },
  { label: "NFC", icon: "nfc" as const, href: "/nfc" },
  { label: "Powiadomienia", icon: "bell" as const, href: "/notifications" },
  { label: "Ustawienia", icon: "settings" as const, href: "/settings" },
];

type Review = {
  id: string;
  author_name: string;
  rating: number;
  content: string;
  created_at: string;
};

type ReviewResponse = {
  review_id: string;
  response_text: string | null;
};

type ReviewInsightSource = {
  created_at: string;
};

type ReviewRangeSource = {
  created_at: string;
  rating: number | null;
};

type ReviewActivityTrendBucket = {
  average_rating: number | null;
  period_end: string;
  period_start: string;
  review_count: number;
};

type ReviewActivityTrendPoint = {
  averageRating: number | null;
  displayHeight: number;
  displayValue: number;
  label: string;
  value: number;
  tooltipLabel: string;
  x: number;
  height: number;
};

type BusinessAnalysis = {
  created_at: string;
  review_count: number;
  summary: string;
  praised_elements: unknown;
  reported_problems: unknown;
  recommendations: unknown;
};

type AiUsage = {
  ai_replies_used: number | null;
  ai_analyses_used: number | null;
};

function formatReviewDate(createdAt: string) {
  const reviewDate = new Date(createdAt);
  const today = new Date();
  const startOfToday = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const startOfReviewDate = Date.UTC(
    reviewDate.getFullYear(),
    reviewDate.getMonth(),
    reviewDate.getDate(),
  );
  const daysAgo = Math.max(
    0,
    Math.floor(
      (startOfToday - startOfReviewDate) / (1000 * 60 * 60 * 24),
    ),
  );

  if (daysAgo === 0) {
    return "Dzisiaj";
  }

  if (daysAgo === 1) {
    return "Wczoraj";
  }

  return `${daysAgo} dni temu`;
}

function formatRating(rating: number) {
  return rating.toLocaleString("pl-PL", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

const polishWeekdays = [
  "Niedziela",
  "Poniedziałek",
  "Wtorek",
  "Środa",
  "Czwartek",
  "Piątek",
  "Sobota",
];

function startOfCurrentMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfPreviousMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() - 1, 1);
}

function endOfPreviousMonth(date: Date) {
  return endOfDay(new Date(date.getFullYear(), date.getMonth(), 0));
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999,
  );
}

function addMonths(date: Date, months: number) {
  const nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + months);
  return nextDate;
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatShortDate(date: Date) {
  return date.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "short",
  });
}

function formatTooltipDate(date: Date) {
  return date.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
  });
}

function formatDisplayDate(date: Date) {
  return date.toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatTooltipRange(startDate: Date, endDate: Date) {
  if (formatDateKey(startDate) === formatDateKey(endDate)) {
    return formatTooltipDate(startDate);
  }

  const sameMonth = startDate.getMonth() === endDate.getMonth();
  const sameYear = startDate.getFullYear() === endDate.getFullYear();

  if (sameMonth && sameYear) {
    return `${startDate.getDate()}-${formatTooltipDate(endDate)}`;
  }

  return `${formatTooltipDate(startDate)} - ${formatTooltipDate(endDate)}`;
}

function formatReviewCount(value: number) {
  if (value === 1) {
    return "1 nowa opinia";
  }

  if (value === 0) {
    return "0 opinii";
  }

  return `${value} nowych opinii`;
}

function formatAverageRating(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return "Brak średniej oceny";
  }

  return `Średnia ocena: ${value.toLocaleString("pl-PL", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}★`;
}

function normalizeTrendRange(range?: string): TrendRange {
  if (range === "3m" || range === "12m") {
    return range;
  }

  return "30d";
}

function parseDateParam(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const date = new Date(`${value}T00:00:00`);

  if (!Number.isFinite(date.getTime()) || formatDateKey(date) !== value) {
    return null;
  }

  return date;
}

function getTrendRangeLabel(range: TrendRange) {
  if (range === "3m") {
    return "Ostatnie 3 miesiące";
  }

  if (range === "12m") {
    return "Ostatnie 12 miesięcy";
  }

  return "Ostatnie 30 dni";
}

function getDashboardDateRange({
  from,
  range,
  to,
}: {
  from?: string;
  range?: string;
  to?: string;
}) {
  const customFrom = parseDateParam(from);
  const customTo = parseDateParam(to);

  if (customFrom && customTo && customFrom <= customTo) {
    return {
      bestDayTitle: "Najlepszy dzień okresu",
      displayLabel: `${formatDisplayDate(customFrom)} – ${formatDisplayDate(customTo)}`,
      from: formatDateKey(customFrom),
      isCustom: true,
      preset: normalizeTrendRange(range),
      start: startOfDay(customFrom),
      to: formatDateKey(customTo),
      end: endOfDay(customTo),
    };
  }

  const preset = normalizeTrendRange(range);
  const today = new Date();
  const end = endOfDay(today);
  let start = startOfDay(addDays(today, -29));
  let bestDayTitle = "Najlepszy dzień miesiąca";

  if (preset === "3m") {
    start = startOfDay(addMonths(today, -3));
    bestDayTitle = "Najlepszy dzień z 3 miesięcy";
  }

  if (preset === "12m") {
    start = startOfDay(addMonths(today, -12));
    bestDayTitle = "Najlepszy dzień z 12 miesięcy";
  }

  return {
    bestDayTitle,
    displayLabel: getTrendRangeLabel(preset),
    from: undefined,
    isCustom: false,
    preset,
    start,
    to: undefined,
    end,
  };
}

function getBestWeekday(reviews: ReviewInsightSource[]) {
  if (reviews.length === 0) {
    return null;
  }

  const counts = Array.from({ length: 7 }, () => 0);

  reviews.forEach((review) => {
    counts[new Date(review.created_at).getDay()] += 1;
  });

  const bestDayIndex = counts.reduce(
    (bestIndex, count, index) => (count > counts[bestIndex] ? index : bestIndex),
    0,
  );

  return {
    count: counts[bestDayIndex],
    dayIndex: bestDayIndex,
    label: polishWeekdays[bestDayIndex],
    percentage: Math.round((counts[bestDayIndex] / reviews.length) * 100),
  };
}

function buildReviewActivityTrend(buckets: ReviewActivityTrendBucket[]) {
  const chartWidth = 720;
  const chartLeft = 18;
  const chartRight = chartWidth - 18;
  const chartBottom = 190;
  const chartTop = 34;
  const chartHeight = chartBottom - chartTop;
  const dailyCounts = buckets.map((bucket) => Number(bucket.review_count ?? 0));
  const maxDailyCount = Math.max(...dailyCounts);
  const labels = buckets
    .filter((_, index) => {
      if (buckets.length <= 6) {
        return true;
      }

      const interval = Math.max(1, Math.floor((buckets.length - 1) / 4));
      return index % interval === 0 || index === buckets.length - 1;
    })
    .map((bucket) => formatShortDate(new Date(bucket.period_start)));

  const points = buckets.map((bucket, index) => {
    const value = dailyCounts[index];
    const displayValue = value === 0 ? 0.2 : value;
    const averageRating = Number(bucket.average_rating);
    const periodStart = new Date(bucket.period_start);
    const periodEnd = new Date(bucket.period_end);
    const x =
      buckets.length > 1
        ? chartLeft + (index / (buckets.length - 1)) * (chartRight - chartLeft)
        : chartWidth / 2;
    const height =
      maxDailyCount > 0 ? (value / maxDailyCount) * chartHeight : 0;
    const displayHeight =
      maxDailyCount > 0
        ? (displayValue / maxDailyCount) * chartHeight
        : value === 0
          ? 4
          : 0;

    return {
      averageRating: Number.isFinite(averageRating) ? averageRating : null,
      displayHeight,
      displayValue,
      label: formatShortDate(periodStart),
      tooltipLabel: formatTooltipRange(periodStart, periodEnd),
      value,
      x,
      height,
    };
  });

  return {
    labels,
    points,
  };
}

function getBucketMode(rangeStart: Date, rangeEnd: Date, preset: TrendRange) {
  const days =
    Math.floor(
      (startOfDay(rangeEnd).getTime() - startOfDay(rangeStart).getTime()) /
        (1000 * 60 * 60 * 24),
    ) + 1;

  if (preset === "3m" || (preset === "30d" && days > 62 && days <= 180)) {
    return "week";
  }

  if (preset === "12m" || days > 180) {
    return "month";
  }

  return "day";
}

function startOfWeek(date: Date) {
  const nextDate = startOfDay(date);
  const day = nextDate.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  nextDate.setDate(nextDate.getDate() + mondayOffset);
  return nextDate;
}

function buildReviewActivityBuckets({
  end,
  preset,
  reviews,
  start,
}: {
  end: Date;
  preset: TrendRange;
  reviews: ReviewRangeSource[];
  start: Date;
}): ReviewActivityTrendBucket[] {
  const mode = getBucketMode(start, end, preset);
  const buckets: Array<{
    end: Date;
    ratings: number[];
    start: Date;
  }> = [];
  let cursor =
    mode === "week"
      ? startOfWeek(start)
      : mode === "month"
        ? new Date(start.getFullYear(), start.getMonth(), 1)
        : startOfDay(start);

  while (cursor <= end) {
    const bucketStart = new Date(cursor);
    let bucketEnd = endOfDay(cursor);

    if (mode === "week") {
      bucketEnd = endOfDay(addDays(bucketStart, 6));
    }

    if (mode === "month") {
      bucketEnd = endOfDay(
        new Date(bucketStart.getFullYear(), bucketStart.getMonth() + 1, 0),
      );
    }

    buckets.push({
      end: bucketEnd > end ? end : bucketEnd,
      ratings: [],
      start: bucketStart < start ? start : bucketStart,
    });

    if (mode === "week") {
      cursor = addDays(cursor, 7);
    } else if (mode === "month") {
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    } else {
      cursor = addDays(cursor, 1);
    }
  }

  reviews.forEach((review) => {
    const createdAt = new Date(review.created_at);
    const rating = Number(review.rating);
    const bucket = buckets.find(
      (item) => createdAt >= item.start && createdAt <= item.end,
    );

    if (bucket && Number.isFinite(rating)) {
      bucket.ratings.push(rating);
    }
  });

  return buckets.map((bucket) => {
    const reviewCount = bucket.ratings.length;
    const averageRating =
      reviewCount > 0
        ? bucket.ratings.reduce((sum, rating) => sum + rating, 0) / reviewCount
        : null;

    return {
      average_rating:
        averageRating === null ? null : Number(averageRating.toFixed(2)),
      period_end: formatDateKey(bucket.end),
      period_start: formatDateKey(bucket.start),
      review_count: reviewCount,
    };
  });
}

function normalizeMonthlyReviewGoal(value: unknown) {
  const goal = Number(value);

  if (!Number.isFinite(goal)) {
    return 30;
  }

  return Math.min(1000, Math.max(1, Math.round(goal)));
}

function buildBusinessInsights(
  reviews: ReviewInsightSource[],
  currentMonthReviews: ReviewInsightSource[],
  previousMonthReviews: ReviewInsightSource[],
  monthlyReviewGoal: number,
  bestDayTitle: string,
) {
  const monthlyGoal = normalizeMonthlyReviewGoal(monthlyReviewGoal);
  const bestCurrentDay = getBestWeekday(reviews);
  const monthlyCount = currentMonthReviews.length;
  const monthlyProgress = Math.min(
    100,
    Math.round((monthlyCount / monthlyGoal) * 100),
  );
  const monthlyDifference = monthlyCount - previousMonthReviews.length;

  return {
    bestDay: bestCurrentDay
      ? {
          detail: `${bestCurrentDay.percentage}% opinii wpadło w ${bestCurrentDay.label.toLowerCase()} w tym okresie.`,
          label: bestCurrentDay.label,
          title: bestDayTitle,
          value: `${bestCurrentDay.count} opinii`,
        }
      : {
          detail: "Pierwsze dane pojawią się po nowej opinii.",
          label: "Brak danych",
          title: bestDayTitle,
          value: "",
        },
    currentMonthComparison: {
      difference: monthlyDifference,
      helperText:
        monthlyDifference > 0
          ? `+${monthlyDifference} względem poprzedniego miesiąca`
          : monthlyDifference < 0
            ? `${monthlyDifference} względem poprzedniego miesiąca`
            : "Bez zmian względem poprzedniego miesiąca",
      marker:
        monthlyDifference > 0
          ? "bg-emerald-500"
          : monthlyDifference < 0
            ? "bg-red-500"
            : "bg-black/25",
      value: `${monthlyCount} ${monthlyCount === 1 ? "opinia" : "opinii"}`,
    },
    monthlyGoal: {
      count: monthlyCount,
      goal: monthlyGoal,
      helperText:
        monthlyCount === 0
          ? "Rozpocznij zbieranie opinii"
          : `Twój cel: ${monthlyGoal} opinii miesięcznie.`,
      progress: monthlyProgress,
      reached: monthlyCount >= monthlyGoal,
    },
  };
}

function usagePercent(used: number, limit: number) {
  if (!Number.isFinite(used) || !Number.isFinite(limit) || limit <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((used / limit) * 100));
}

function UsageProgress({
  used,
  limit,
}: {
  used: number;
  limit: number;
}) {
  return (
    <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/[0.06]">
      <div
        className="h-full rounded-full bg-brand"
        style={{ width: `${usagePercent(used, limit)}%` }}
      />
    </div>
  );
}

function AiUsageCard({
  plan,
  repliesUsed,
  repliesLimit,
  analysesUsed,
  analysesLimit,
}: {
  plan: AppPlan;
  repliesUsed: number;
  repliesLimit: number;
  analysesUsed: number;
  analysesLimit: number;
}) {
  const isUnpaid = plan === "unpaid";
  const remainingReplies = Math.max(repliesLimit - repliesUsed, 0);
  const remainingAnalyses = Math.max(analysesLimit - analysesUsed, 0);

  return (
    <article className="w-full min-w-0 overflow-hidden rounded-[24px] border border-black/[0.06] bg-white p-5 shadow-card sm:p-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-black/35">
            Limity planu
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">
            Okres rozliczeniowy
          </h2>
        </div>
        <span className="self-start rounded-full bg-brand-soft px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-brand">
          Plan {getPlanLabel(plan)}
        </span>
      </div>

      {isUnpaid ? (
        <div className="mt-5 rounded-2xl border border-brand/10 bg-brand-soft px-4 py-3 text-sm font-semibold text-brand">
          Wybierz plan, aby korzystać z funkcji automatyzacji
        </div>
      ) : null}

      <div className="mt-5 grid min-w-0 gap-4 sm:grid-cols-2">
        <div className="min-w-0 rounded-2xl border border-black/[0.05] bg-[#FAFAFC] p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold">Odpowiedzi na opinie</p>
            <p className="text-sm font-semibold text-brand">
              {remainingReplies} pozostało
            </p>
          </div>
          <UsageProgress used={repliesUsed} limit={repliesLimit} />
          <p className="mt-2 text-[11px] text-black/35">
            {usagePercent(repliesUsed, repliesLimit)}% limitu
          </p>
          <p className="mt-1 text-[11px] text-black/35">
            Wykorzystano {repliesUsed} z {repliesLimit}
          </p>
        </div>
        <div className="min-w-0 rounded-2xl border border-black/[0.05] bg-[#FAFAFC] p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold">Analizy reputacji</p>
            <p className="text-sm font-semibold text-brand">
              {remainingAnalyses} pozostało
            </p>
          </div>
          <UsageProgress used={analysesUsed} limit={analysesLimit} />
          <p className="mt-2 text-[11px] text-black/35">
            {usagePercent(analysesUsed, analysesLimit)}% limitu
          </p>
          <p className="mt-1 text-[11px] text-black/35">
            Wykorzystano {analysesUsed} z {analysesLimit}
          </p>
        </div>
      </div>
    </article>
  );
}

function TrendChart({ points }: { points: ReviewActivityTrendPoint[] }) {
  const chartBottom = 190;
  const chartTop = 30;
  const chartHeight = chartBottom - chartTop;
  const barWidth = Math.max(7, Math.min(15, Math.floor(420 / points.length)));

  return (
    <div className="relative mt-5 h-[220px] w-full overflow-visible">
      {points.length > 0 ? (
        <>
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
            viewBox="0 0 720 220"
            preserveAspectRatio="none"
            role="img"
            aria-label="Liczba nowych opinii z ostatnich 30 dni"
          >
            {[70, 120].map((y) => (
              <line
                key={y}
                x1="18"
                y1={y}
                x2="702"
                y2={y}
                stroke="#0F0F10"
                strokeOpacity=".06"
                strokeDasharray="4 9"
              />
            ))}
            <line
              x1="18"
              y1={chartBottom}
              x2="702"
              y2={chartBottom}
              stroke="#0F0F10"
              strokeOpacity=".18"
            />
          </svg>
          {points.map((point) => {
            const visibleHeight = Math.max(
              point.displayHeight,
              point.value > 0 ? 10 : 4,
            );
            const leftPercent = (point.x / 720) * 100;
            const tooltipEdgeClass =
              point.x < 150
                ? "left-0"
                : point.x > 570
                  ? "right-0"
                  : "left-1/2 -translate-x-1/2";
            const barClassName =
              point.value > 0
                ? "bg-brand opacity-[0.86]"
                : "bg-[#D1D5DB] dark:bg-[#4B5563]";

            return (
              <div
                key={`${point.tooltipLabel}-${point.x}`}
                className="group absolute z-10 outline-none hover:z-50 focus:z-50"
                style={{
                  bottom: `${220 - chartBottom}px`,
                  height: `${chartHeight}px`,
                  left: `${leftPercent}%`,
                  transform: "translateX(-50%)",
                  width: `${Math.max(barWidth, 18)}px`,
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
                  style={{
                    bottom: `${visibleHeight + 14}px`,
                  }}
                >
                  <p className="text-[13px] font-semibold leading-[1.4] text-white/95">
                    {point.tooltipLabel}
                  </p>
                  <p className="mt-1 text-[13px] font-medium leading-[1.4] text-white/80">
                    {formatReviewCount(point.value)}
                  </p>
                  <p className="mt-1 text-xs leading-[1.4] text-white/55">
                    {formatAverageRating(point.averageRating)}
                  </p>
                </div>
              </div>
            );
          })}
        </>
      ) : (
        <div className="grid h-full place-items-center rounded-2xl border border-dashed border-black/[0.08] bg-[#FAFAFC] px-5 text-center">
          <p className="max-w-sm text-sm font-semibold leading-6 text-black/45">
            Brak opinii w wybranym okresie
          </p>
        </div>
      )}
    </div>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    ai_error?: string;
    billing_error?: string;
    checkout?: string;
    from?: string;
    to?: string;
    trend_range?: string;
  }>;
}) {
  const params = await searchParams;
  const isCheckoutSuccess = params.checkout === "success";
  const selectedRange = getDashboardDateRange({
    from: params.from,
    range: params.trend_range,
    to: params.to,
  });
  const trendRange = selectedRange.preset;
  const dashboardMessage =
    params.ai_error ??
    params.billing_error ??
    (isCheckoutSuccess
      ? "Plan został aktywowany. Możesz już korzystać z NuvoRate."
      : undefined);
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims) {
    redirect("/login?next=/dashboard");
  }

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const [
    { data: business, error: businessError },
    { data: profile, error: profileError },
  ] = await Promise.all([
    supabase
      .from("businesses")
      .select("id, name, industry, city, monthly_review_goal")
      .eq("owner_id", user.id)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("first_name, plan, stripe_customer_id, subscription_status")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  if (businessError || profileError) {
    throw new Error(
      "Nie udało się odczytać danych firmy lub profilu. Sprawdź konfigurację Supabase.",
    );
  }

  if (!business) {
    redirect("/onboarding");
  }

  if (!profile) {
    throw new Error(
      "Nie znaleziono profilu użytkownika. Sprawdź konfigurację Supabase.",
    );
  }

  const appPlan = normalizePlan(profile.plan);
  const isPaid = isPaidPlan(appPlan);
  const businessName = business.name ?? "Twoja firma";
  const businessIndustry = business.industry ?? "Branża nieuzupełniona";
  const businessCity = business.city ?? "Miasto nieuzupełnione";
  const plan = getPlanLabel(appPlan);
  const firstName =
    typeof profile.first_name === "string" ? profile.first_name.trim() : "";
  const accountDisplayName = firstName || user.email || "NU";
  const hasActiveSubscription =
    Boolean(profile.stripe_customer_id) &&
    ["active", "trialing"].includes(profile.subscription_status ?? "");
  const periodMonth = currentPeriodMonth();
  const { data: aiUsage, error: aiUsageError } = await supabase
    .from("ai_usage")
    .select("ai_replies_used, ai_analyses_used")
    .eq("user_id", user.id)
    .eq("period_month", periodMonth)
    .maybeSingle();

  if (aiUsageError) {
    console.warn("AI usage lookup failed", aiUsageError);
  }

  const currentAiUsage = aiUsageError ? null : (aiUsage as AiUsage | null);
  const aiRepliesUsedRaw = Number(currentAiUsage?.ai_replies_used ?? 0);
  const aiAnalysesUsedRaw = Number(currentAiUsage?.ai_analyses_used ?? 0);
  const aiRepliesUsed = Number.isFinite(aiRepliesUsedRaw)
    ? aiRepliesUsedRaw
    : 0;
  const aiAnalysesUsed = Number.isFinite(aiAnalysesUsedRaw)
    ? aiAnalysesUsedRaw
    : 0;
  const aiRepliesLimit = getAiLimit(appPlan, "reply");
  const aiAnalysesLimit = getAiLimit(appPlan, "analysis");
  const remainingReplies = Math.max(aiRepliesLimit - aiRepliesUsed, 0);
  const checkoutAvailability = {
    monthly: {
      business: hasPriceIdForPlan("business", "monthly"),
      starter: hasPriceIdForPlan("starter", "monthly"),
    },
    yearly: {
      business: hasPriceIdForPlan("business", "yearly"),
      starter: hasPriceIdForPlan("starter", "yearly"),
    },
  };

  if (!isPaid && isCheckoutSuccess) {
    return (
      <main className="min-h-screen bg-[#F7F7FA] text-ink">
        <div className="flex min-h-screen items-center justify-center px-5 py-12">
          <section className="w-full max-w-3xl rounded-[32px] border border-black/[0.06] bg-white p-7 text-center shadow-card sm:p-10">
            <div className="mx-auto flex justify-center">
              <BrandLogo />
            </div>
            <CheckoutActivationStatus />
            <form action={signOut} className="mt-5">
              <button type="submit" className="text-sm font-semibold text-black/40 hover:text-ink">
                Wyloguj się
              </button>
            </form>
          </section>
        </div>
      </main>
    );
  }

  if (!isPaid) {
    return (
      <main className="min-h-screen bg-[#F7F7FA] text-ink">
        <div className="flex min-h-screen items-center justify-center px-5 py-12">
          <section className="w-full max-w-5xl rounded-[32px] border border-black/[0.06] bg-white p-7 text-center shadow-card sm:p-10">
            <div className="mx-auto flex justify-center">
              <BrandLogo />
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Aktywuj NuvoRate
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-black/50">
              Konto jest gotowe. Wybierz plan, aby rozpocząć monitorowanie
              opinii i rozwijać reputację swojej firmy.
            </p>
            {dashboardMessage && (
              <div className="mt-6 rounded-2xl border border-brand/15 bg-brand-soft px-4 py-3 text-sm font-semibold text-brand">
                {dashboardMessage}
              </div>
            )}
            <div className="mt-8">
              <PlanPicker checkoutAvailability={checkoutAvailability} />
            </div>
            <form action={signOut} className="mt-5">
              <button type="submit" className="text-sm font-semibold text-black/40 hover:text-ink">
                Wyloguj się
              </button>
            </form>
          </section>
        </div>
      </main>
    );
  }

  const now = new Date();
  const currentMonthStart = startOfCurrentMonth(now);
  const previousMonthStart = startOfPreviousMonth(now);
  const previousMonthEnd = endOfPreviousMonth(now);

  const [
    { data: reviews, error: reviewsError },
    {
      data: reviewRatings,
      count: reviewsCount,
      error: reviewStatsError,
    },
    { data: insightReviews, error: insightReviewsError },
    { data: currentMonthReviews, error: currentMonthReviewsError },
    { data: previousMonthReviews, error: previousMonthReviewsError },
  ] = await Promise.all([
    supabase
      .from("reviews")
      .select("id, author_name, rating, content, created_at")
      .eq("business_id", business.id)
      .gte("created_at", selectedRange.start.toISOString())
      .lte("created_at", selectedRange.end.toISOString())
      .order("created_at", { ascending: false, nullsFirst: false })
      .order("id", { ascending: false })
      .limit(3),
    supabase
      .from("reviews")
      .select("rating, created_at", { count: "exact" })
      .eq("business_id", business.id)
      .gte("created_at", selectedRange.start.toISOString())
      .lte("created_at", selectedRange.end.toISOString()),
    supabase
      .from("reviews")
      .select("created_at")
      .eq("business_id", business.id)
      .gte("created_at", selectedRange.start.toISOString())
      .lte("created_at", selectedRange.end.toISOString()),
    supabase
      .from("reviews")
      .select("created_at")
      .eq("business_id", business.id)
      .gte("created_at", currentMonthStart.toISOString())
      .lte("created_at", now.toISOString()),
    supabase
      .from("reviews")
      .select("created_at")
      .eq("business_id", business.id)
      .gte("created_at", previousMonthStart.toISOString())
      .lte("created_at", previousMonthEnd.toISOString()),
  ]);

  if (
    reviewsError ||
    reviewStatsError ||
    insightReviewsError ||
    currentMonthReviewsError ||
    previousMonthReviewsError
  ) {
    throw new Error(
      "Nie udało się odczytać opinii. Uruchom migrację reviews w Supabase.",
    );
  }

  const [
    { data: reviewResponses, error: reviewResponsesError },
    { data: businessAnalysis, error: businessAnalysisError },
  ] = await Promise.all([
    supabase
      .from("ai_review_responses")
      .select("review_id, response_text")
      .eq("business_id", business.id),
    supabase
      .from("ai_business_analyses")
      .select(
        "created_at, review_count, summary, praised_elements, reported_problems, recommendations",
      )
      .eq("business_id", business.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (reviewResponsesError || businessAnalysisError) {
    throw new Error(
      "Nie udało się odczytać danych odpowiedzi na opinie i analiz reputacji. Uruchom migrację 003_ai_features.sql w Supabase.",
    );
  }

  const ratings = (reviewRatings ?? [])
    .map((review) => Number(review.rating))
    .filter((rating) => Number.isFinite(rating));
  const latestReviews = [...((reviews ?? []) as Review[])]
    .sort((firstReview, secondReview) => {
      const createdAtDifference =
        new Date(secondReview.created_at).getTime() -
        new Date(firstReview.created_at).getTime();

      if (createdAtDifference !== 0) {
        return createdAtDifference;
      }

      return secondReview.id.localeCompare(firstReview.id);
    })
    .slice(0, 3);
  const totalReviews = reviewsCount ?? ratings.length;
  const averageRating =
    totalReviews > 0
      ? ratings.reduce((sum, rating) => sum + rating, 0) / totalReviews
      : 0;
  const positiveReviews = ratings.filter((rating) => rating >= 4).length;
  const positiveReviewsPercentage =
    totalReviews > 0
      ? Math.round((positiveReviews / totalReviews) * 100)
      : 0;
  const businessInsights =
    appPlan === "business"
      ? buildBusinessInsights(
          (insightReviews ?? []) as ReviewInsightSource[],
          (currentMonthReviews ?? []) as ReviewInsightSource[],
          (previousMonthReviews ?? []) as ReviewInsightSource[],
          normalizeMonthlyReviewGoal(business.monthly_review_goal),
          selectedRange.bestDayTitle,
        )
      : null;
  const reviewActivityBuckets = buildReviewActivityBuckets({
    end: selectedRange.end,
    preset: trendRange,
    reviews: (reviewRatings ?? []) as ReviewRangeSource[],
    start: selectedRange.start,
  });
  const reviewActivityTrend = buildReviewActivityTrend(
    reviewActivityBuckets,
  );

  const metrics = [
    {
      label: "Nowe opinie",
      value: totalReviews.toLocaleString("pl-PL"),
      change: selectedRange.displayLabel,
      detail: "w wybranym okresie",
      icon: "reviews" as const,
    },
    {
      label: "Średnia ocena",
      value: averageRating.toLocaleString("pl-PL", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }),
      change: "Aktualna",
      detail: "w skali do 5",
      icon: "star" as const,
    },
    {
      label: "Pozytywne opinie",
      value: `${positiveReviewsPercentage}%`,
      change: "Oceny 4–5",
      detail: `${positiveReviews} z ${totalReviews} opinii`,
      icon: "trend" as const,
    },
    {
      label: "Skany NFC",
      value: "0",
      change: "Śledzenie NFC",
      detail: "skany z plakietek i kart",
      icon: "nfc" as const,
    },
  ];

  const responsesByReviewId = new Map<string, string | null>(
    ((reviewResponses ?? []) as ReviewResponse[])
      .filter((response) => typeof response.review_id === "string")
      .map((response) => [
        response.review_id,
        typeof response.response_text === "string"
          ? response.response_text
          : null,
      ]),
  );
  const latestAnalysis = businessAnalysis as BusinessAnalysis | null;
  const praisedElements = Array.isArray(latestAnalysis?.praised_elements)
    ? latestAnalysis.praised_elements.filter(
        (item): item is string => typeof item === "string",
      )
    : [];
  const reportedProblems = Array.isArray(latestAnalysis?.reported_problems)
    ? latestAnalysis.reported_problems.filter(
        (item): item is string => typeof item === "string",
      )
    : [];
  const recommendations = Array.isArray(latestAnalysis?.recommendations)
    ? latestAnalysis.recommendations.filter(
        (item): item is string => typeof item === "string",
      )
    : [];

  return (
    <main className="min-h-screen bg-[#F7F7FA] text-ink">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[252px] flex-col border-r border-black/[0.06] bg-white px-5 py-6 lg:flex">
        <BrandLogo />
        <div className="mt-9 rounded-2xl border border-black/[0.06] bg-[#FAFAFC] p-3.5">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-black/35">
            Twoja firma
          </p>
          <p className="mt-1.5 truncate font-semibold">{businessName}</p>
          <p className="mt-2 truncate text-xs text-black/40">{businessIndustry}</p>
          <p className="mt-1 truncate text-xs text-black/40">{businessCity}</p>
          <p className="mt-2 text-[11px] font-semibold text-brand">Plan {plan}</p>
        </div>
        <nav className="mt-7 space-y-1.5" aria-label="Nawigacja dashboardu">
          {navigation.map((item) => {
            const className = `sidebar-nav-item flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition ${
                item.active
                  ? "bg-brand-soft text-brand"
                  : "text-black/45 hover:bg-black/[0.035] hover:text-ink"
              }`;

            if (item.label === "Opinie" || item.href) {
              return (
                <Link
                  key={item.label}
                  href={item.href ?? "/reviews"}
                  className={className}
                >
                  <Icon name={item.icon} className="h-[18px] w-[18px]" />
                  <span className="min-w-0 flex-1">{item.label}</span>
                  {item.label === "Powiadomienia" ? (
                    <NotificationSidebarBadge businessId={business.id} />
                  ) : null}
                </Link>
              );
            }

            return (
              <button key={item.label} type="button" className={className}>
                <Icon name={item.icon} className="h-[18px] w-[18px]" />
                <span className="min-w-0 flex-1">{item.label}</span>
                {item.label === "Powiadomienia" ? (
                  <NotificationSidebarBadge businessId={business.id} />
                ) : null}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto">
          <div className="rounded-2xl bg-ink p-4 text-white">
            <p className="text-[11px] text-white/45">Aktywny plan</p>
            <div className="mt-1 flex items-center justify-between">
              <p className="font-semibold">{plan}</p>
              <span className="rounded-full bg-brand px-2 py-1 text-[9px] font-semibold uppercase tracking-wider">
                aktywny
              </span>
            </div>
            {hasActiveSubscription ? (
              <Link href="/billing/portal" className="mt-4 block w-full rounded-xl bg-white/10 px-3 py-2.5 text-center text-xs font-semibold text-white transition hover:bg-white/15">
                Zarządzaj subskrypcją
              </Link>
            ) : plan === "Starter" ? (
              <Link href="/checkout?plan=business" className="mt-4 block w-full rounded-xl bg-white/10 px-3 py-2.5 text-center text-xs font-semibold text-white transition hover:bg-white/15">
                Przejdź na Business
              </Link>
            ) : null}
          </div>
          <form action={signOut} className="mt-3">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-black/45 transition hover:bg-red-50 hover:text-red-600"
            >
              <Icon name="logout" className="h-[18px] w-[18px]" />
              Wyloguj się
            </button>
          </form>
        </div>
      </aside>

      <div className="lg:pl-[252px]">
        <header className="dashboard-topbar sticky top-0 z-20 border-b border-black/[0.06] bg-white/90 backdrop-blur-xl">
          <div className="flex h-[74px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-9">
            <div className="lg:hidden">
              <BrandLogo />
            </div>
            <div className="hidden lg:block">
              <p className="text-xs text-black/35">{businessName}</p>
              <p className="mt-0.5 text-sm font-semibold">Pulpit główny</p>
            </div>
            <div className="flex items-center gap-2.5">
              <TrendRangeSelect
                from={selectedRange.from}
                isCustom={selectedRange.isCustom}
                label={selectedRange.displayLabel}
                to={selectedRange.to}
                value={trendRange}
              />
              <NotificationBell businessId={business.id} />
              <div className="hidden items-center gap-3 rounded-xl border border-black/[0.08] bg-white py-1.5 pl-1.5 pr-3 sm:flex">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-soft text-xs font-bold uppercase text-brand">
                  {accountDisplayName.slice(0, 2)}
                </span>
                <div className="max-w-[150px]">
                  <p className="truncate text-xs font-semibold">{user.email}</p>
                  <p className="text-[10px] text-black/35">Plan {plan}</p>
                </div>
              </div>
              <form action={signOut} className="lg:hidden">
                <button
                  type="submit"
                  className="grid h-11 w-11 place-items-center rounded-xl border border-black/[0.08] bg-white text-black/50"
                  aria-label="Wyloguj się"
                >
                  <Icon name="logout" className="h-[18px] w-[18px]" />
                </button>
              </form>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto border-t border-black/[0.05] px-4 py-2 lg:hidden" aria-label="Mobilna nawigacja dashboardu">
            {navigation.slice(0, 5).map((item) => (
              item.label === "Opinie" || item.href ? (
                <Link
                  key={item.label}
                  href={item.href ?? "/reviews"}
                  className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium ${
                    item.active ? "bg-brand-soft text-brand" : "text-black/40"
                  }`}
                >
                  <Icon name={item.icon} className="h-4 w-4" />
                  {item.label}
                </Link>
              ) : (
                <button
                  key={item.label}
                  type="button"
                  className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium ${
                  item.active ? "bg-brand-soft text-brand" : "text-black/40"
                }`}
                >
                  <Icon name={item.icon} className="h-4 w-4" />
                  {item.label}
                </button>
              )
            ))}
          </nav>
        </header>

        <div className="px-5 py-8 sm:px-8 lg:px-9 lg:py-10">
          <div className="mx-auto max-w-[1450px]">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                  Dzień dobry{firstName ? `, ${firstName}` : ""}
                </h1>
                <p className="mt-2 text-sm leading-6 text-black/45">
                  Podsumowanie reputacji firmy {businessName}.
                </p>
              </div>
              <GoogleSyncButton />
            </div>

            <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Najważniejsze statystyki">
              {dashboardMessage && (
                <div className="flex flex-col gap-3 rounded-[22px] border border-brand/15 bg-brand-soft p-5 text-sm font-semibold text-brand shadow-card sm:col-span-2 sm:flex-row sm:items-center sm:justify-between xl:col-span-4">
                  <span>{dashboardMessage}</span>
                  {params.ai_error && appPlan === "starter" && (
                    <Link href="/checkout?plan=business" className="rounded-xl bg-brand px-4 py-2.5 text-center text-xs font-semibold text-white transition hover:bg-[#4D4EE8]">
                      Przejdź na Business
                    </Link>
                  )}
                </div>
              )}
              {metrics.map((metric) => (
                <article key={metric.label} className="rounded-[22px] border border-black/[0.06] bg-white p-5 shadow-card">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-black/40">{metric.label}</p>
                      <p className="mt-3 text-3xl font-semibold tracking-[-0.04em]">{metric.value}</p>
                    </div>
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-brand">
                      <Icon name={metric.icon} className="h-[18px] w-[18px]" />
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                      {metric.change}
                    </span>
                    <span className="text-[11px] text-black/30">{metric.detail}</span>
                  </div>
                </article>
              ))}
            </section>

            <section className="mt-4" aria-label="Limity planu">
              <AiUsageCard
                plan={appPlan}
                repliesUsed={aiRepliesUsed}
                repliesLimit={aiRepliesLimit}
                analysesUsed={aiAnalysesUsed}
                analysesLimit={aiAnalysesLimit}
              />
            </section>

            <section className="mt-4 grid items-start gap-4 xl:grid-cols-[1.55fr_0.75fr]">
              <article className="h-fit self-start rounded-[24px] border border-black/[0.06] bg-white p-5 shadow-card sm:p-6">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.12em] text-black/35">
                      Nowe opinie
                    </p>
                    <h2 className="mt-1 text-xl font-semibold tracking-tight">Nowe opinie w czasie</h2>
                  </div>
                  <div className="flex gap-4 text-xs">
                    <span className="flex items-center gap-2 text-black/50">
                      <span className="h-2 w-2 rounded-full bg-brand" />
                      Bieżący okres
                    </span>
                    <span className="flex items-center gap-2 text-black/20">
                      <span className="h-2 w-2 rounded-full bg-black/15" />
                      Poprzedni okres
                    </span>
                  </div>
                </div>
                <TrendChart points={reviewActivityTrend.points} />
                <div className="flex justify-between text-[10px] font-medium text-black/35">
                  {reviewActivityTrend.labels.map((label) => (
                    <span key={label}>{label}</span>
                  ))}
                </div>
                {businessInsights && (
                  <div className="mt-4 border-t border-black/[0.06] pt-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-[0.12em] text-black/35">
                          Business Insights
                        </p>
                        <p className="mt-1 text-sm text-black/45">
                          Krótkie sygnały z opinii dla planu Business.
                        </p>
                      </div>
                      <span className="rounded-full bg-brand-soft px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-brand">
                        Business
                      </span>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <article className="rounded-2xl border border-black/[0.06] bg-[#FAFAFC] p-4">
                        <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-black/35">
                          {businessInsights.bestDay.title}
                        </p>
                        <p className="mt-3 text-lg font-semibold tracking-tight">
                          {businessInsights.bestDay.label}
                        </p>
                        {businessInsights.bestDay.value ? (
                          <p className="mt-1 text-sm font-semibold text-brand">
                            {businessInsights.bestDay.value}
                          </p>
                        ) : null}
                        <p className="mt-2 text-xs leading-5 text-black/45">
                          {businessInsights.bestDay.detail}
                        </p>
                      </article>

                      <article className="rounded-2xl border border-black/[0.06] bg-[#FAFAFC] p-4">
                        <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-black/35">
                          Ten miesiąc
                        </p>
                        <p className="mt-3 text-lg font-semibold tracking-tight">
                          {businessInsights.currentMonthComparison.value}
                        </p>
                        <p className="mt-2 flex items-center gap-2 text-xs leading-5 text-black/45">
                          <span
                            className={`h-2 w-2 rounded-full ${businessInsights.currentMonthComparison.marker}`}
                          />
                          {businessInsights.currentMonthComparison.helperText}
                        </p>
                      </article>

                      <MonthlyGoalCard
                        count={businessInsights.monthlyGoal.count}
                        goal={businessInsights.monthlyGoal.goal}
                        helperText={businessInsights.monthlyGoal.helperText}
                        progress={businessInsights.monthlyGoal.progress}
                        reached={businessInsights.monthlyGoal.reached}
                      />
                    </div>
                  </div>
                )}
              </article>

              <AnalysisPreviewCard
                createdAt={latestAnalysis?.created_at}
                praisedElements={praisedElements}
                recommendations={recommendations}
                reportedProblems={reportedProblems}
                reviewCount={latestAnalysis?.review_count}
                summary={latestAnalysis?.summary}
              />
            </section>

            <section className="mt-6 rounded-[24px] border border-black/[0.06] bg-white p-5 shadow-card sm:p-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-black/35">
                    Ostatnie opinie
                  </p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight">
                    Najnowsze opinie klientów
                  </h2>
                </div>
                <div className="flex gap-2">
                  <Link href="/reviews" className="rounded-xl bg-brand-soft px-3.5 py-2.5 text-xs font-semibold text-brand">
                    Zobacz wszystkie
                  </Link>
                </div>
              </div>
              {latestReviews.length > 0 ? (
                <div className="mt-5 grid gap-3 lg:grid-cols-3">
                  {latestReviews.map((review) => (
                    <article key={review.id} className="rounded-2xl border border-black/[0.06] bg-[#FAFAFC] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-xs font-bold text-brand shadow-sm">
                            {review.author_name.slice(0, 1)}
                          </span>
                          <div>
                            <p className="text-sm font-semibold">{review.author_name}</p>
                            <p className="text-[10px] text-black/30">
                              {formatReviewDate(review.created_at)}
                            </p>
                          </div>
                        </div>
                        <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${review.rating <= 2 ? "bg-red-50 text-red-600" : "bg-brand-soft text-brand"}`}>
                          {formatRating(review.rating)} ★
                        </span>
                      </div>
                      <p className="mt-4 min-h-12 text-sm leading-6 text-black/55">{review.content}</p>
                      <ReviewResponseForm
                        reviewId={review.id}
                        initialResponseText={responsesByReviewId.get(review.id)}
                        isReplyLimitReached={remainingReplies <= 0}
                      />
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-black/[0.08] bg-[#FAFAFC] px-5 py-10 text-center">
                  <p className="text-sm font-semibold">
                    Brak opinii. Pierwsze opinie pojawią się tutaj.
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
