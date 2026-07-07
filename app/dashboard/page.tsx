import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckoutActivationStatus } from "@/components/billing/checkout-activation-status";
import { PlanPicker } from "@/components/billing/plan-picker";
import { BrandLogo } from "@/components/brand/logo";
import { AnalysisPreviewCard } from "@/components/dashboard/analysis-preview-card";
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

type ReviewActivityTrendBucket = {
  average_rating: number | null;
  period_end: string;
  period_start: string;
  review_count: number;
};

type ReviewActivityTrendPoint = {
  averageRating: number | null;
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

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
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
    const averageRating = Number(bucket.average_rating);
    const periodStart = new Date(bucket.period_start);
    const periodEnd = new Date(bucket.period_end);
    const x =
      buckets.length > 1
        ? chartLeft + (index / (buckets.length - 1)) * (chartRight - chartLeft)
        : chartWidth / 2;
    const height =
      maxDailyCount > 0 ? (value / maxDailyCount) * chartHeight : 0;

    return {
      averageRating: Number.isFinite(averageRating) ? averageRating : null,
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

function buildBusinessInsights(reviews: ReviewInsightSource[]) {
  const now = new Date();
  const currentWeekStart = addDays(now, -7);
  const previousWeekStart = addDays(now, -14);
  const monthStart = startOfCurrentMonth(now);
  const monthlyGoal = 30;

  const currentWeekReviews = reviews.filter((review) => {
    const createdAt = new Date(review.created_at);
    return createdAt >= currentWeekStart && createdAt <= now;
  });
  const previousWeekReviews = reviews.filter((review) => {
    const createdAt = new Date(review.created_at);
    return createdAt >= previousWeekStart && createdAt < currentWeekStart;
  });
  const currentMonthReviews = reviews.filter((review) => {
    const createdAt = new Date(review.created_at);
    return createdAt >= monthStart && createdAt <= now;
  });

  const bestCurrentDay = getBestWeekday(currentWeekReviews);
  const bestPreviousDay = getBestWeekday(previousWeekReviews);
  const monthlyCount = currentMonthReviews.length;
  const monthlyProgress = Math.min(
    100,
    Math.round((monthlyCount / monthlyGoal) * 100),
  );

  let repeatability = "Zbieramy dane do porównania.";

  if (bestCurrentDay && bestPreviousDay) {
    repeatability =
      bestCurrentDay.dayIndex === bestPreviousDay.dayIndex
        ? `${bestCurrentDay.label} dominuje 2 tygodnie z rzędu`
        : `Zmiana z ${bestPreviousDay.label.toLowerCase()} na ${bestCurrentDay.label.toLowerCase()}`;
  } else if (!bestCurrentDay && !bestPreviousDay) {
    repeatability = "Pierwsze porównanie pojawi się po zebraniu opinii.";
  }

  let reviewPace = "Pierwsze tempo pojawi się po zebraniu opinii.";

  if (currentWeekReviews.length > 0 || previousWeekReviews.length > 0) {
    if (previousWeekReviews.length === 0 && currentWeekReviews.length > 0) {
      reviewPace = "Nowe opinie w tym tygodniu";
    } else {
      const paceChange = Math.round(
        ((currentWeekReviews.length - previousWeekReviews.length) /
          previousWeekReviews.length) *
          100,
      );
      reviewPace = `${paceChange > 0 ? "+" : ""}${paceChange}% względem poprzedniego tygodnia`;
    }
  }

  return {
    bestDay: bestCurrentDay
      ? {
          detail: `${bestCurrentDay.percentage}% opinii wpada w ${bestCurrentDay.label.toLowerCase()}`,
          label: bestCurrentDay.label,
          value: `${bestCurrentDay.count} opinii`,
        }
      : null,
    monthlyGoal: {
      count: monthlyCount,
      goal: monthlyGoal,
      helperText:
        monthlyCount === 0
          ? "Rozpocznij zbieranie opinii"
          : "Domyślny cel: 30 opinii miesięcznie.",
      progress: monthlyProgress,
      reached: monthlyCount >= monthlyGoal,
    },
    repeatability,
    reviewPace,
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
            const visibleHeight = Math.max(point.height, point.value > 0 ? 10 : 3);
            const leftPercent = (point.x / 720) * 100;
            const tooltipEdgeClass =
              point.x < 150
                ? "left-0"
                : point.x > 570
                  ? "right-0"
                  : "left-1/2 -translate-x-1/2";

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
                  className="absolute bottom-0 left-1/2 rounded-t-[4px] transition-colors duration-200 group-hover:bg-brand group-focus:bg-brand"
                  style={{
                    backgroundColor: point.value > 0 ? "#5B5CF6" : "#0F0F10",
                    height: `${visibleHeight}px`,
                    opacity: point.value > 0 ? 0.86 : 0.18,
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
    trend_range?: string;
  }>;
}) {
  const params = await searchParams;
  const isCheckoutSuccess = params.checkout === "success";
  const trendRange = normalizeTrendRange(params.trend_range);
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
      .select("id, name, industry, city")
      .eq("owner_id", user.id)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("plan, stripe_customer_id, subscription_status")
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
  const displayName = user.email?.split("@")[0] ?? "użytkowniku";
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
  const insightRangeStart = new Date(
    Math.min(
      startOfCurrentMonth(now).getTime(),
      addDays(now, -14).getTime(),
    ),
  ).toISOString();
  const insightRangeEnd = now.toISOString();

  const [
    { data: reviews, error: reviewsError },
    {
      data: reviewRatings,
      count: reviewsCount,
      error: reviewStatsError,
    },
    { data: insightReviews, error: insightReviewsError },
    { data: trendReviews, error: trendReviewsError },
  ] = await Promise.all([
    supabase
      .from("reviews")
      .select("id, author_name, rating, content, created_at")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false, nullsFirst: false })
      .order("id", { ascending: false })
      .limit(3),
    supabase
      .from("reviews")
      .select("rating", { count: "exact" })
      .eq("business_id", business.id),
    supabase
      .from("reviews")
      .select("created_at")
      .eq("business_id", business.id)
      .gte("created_at", insightRangeStart)
      .lte("created_at", insightRangeEnd),
    supabase
      .rpc("get_review_activity_trend", {
        p_business_id: business.id,
        p_range: trendRange,
      }),
  ]);

  if (
    reviewsError ||
    reviewStatsError ||
    insightReviewsError ||
    trendReviewsError
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

  const ratings = reviewRatings.map((review) => Number(review.rating));
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
      ? buildBusinessInsights((insightReviews ?? []) as ReviewInsightSource[])
      : null;
  const reviewActivityTrend = buildReviewActivityTrend(
    (trendReviews ?? []) as ReviewActivityTrendBucket[],
  );

  const metrics = [
    {
      label: "Nowe opinie",
      value: totalReviews.toLocaleString("pl-PL"),
      change: "Łącznie",
      detail: "wszystkie opinie",
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
              <TrendRangeSelect value={trendRange} />
              <NotificationBell businessId={business.id} />
              <div className="hidden items-center gap-3 rounded-xl border border-black/[0.08] bg-white py-1.5 pl-1.5 pr-3 sm:flex">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-soft text-xs font-bold uppercase text-brand">
                  {displayName.slice(0, 2)}
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
                  Dzień dobry, {displayName}
                </h1>
                <p className="mt-2 text-sm leading-6 text-black/45">
                  Podsumowanie reputacji firmy {businessName}.
                </p>
              </div>
              <button type="button" className="button-primary self-start sm:self-auto">
                Skopiuj link do opinii
              </button>
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
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <article className="rounded-2xl border border-black/[0.06] bg-[#FAFAFC] p-4">
                        <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-black/35">
                          Najlepszy dzień
                        </p>
                        {businessInsights.bestDay ? (
                          <>
                            <p className="mt-3 text-lg font-semibold tracking-tight">
                              {businessInsights.bestDay.label}
                            </p>
                            <p className="mt-1 text-sm font-semibold text-brand">
                              {businessInsights.bestDay.value}
                            </p>
                            <p className="mt-2 text-xs leading-5 text-black/45">
                              {businessInsights.bestDay.detail}
                            </p>
                          </>
                        ) : (
                          <p className="mt-3 text-sm font-semibold text-black/45">
                            Pierwsze dane pojawią się po nowej opinii
                          </p>
                        )}
                      </article>

                      <article className="rounded-2xl border border-black/[0.06] bg-[#FAFAFC] p-4">
                        <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-black/35">
                          Powtarzalność
                        </p>
                        <p className="mt-3 text-sm font-semibold leading-5 text-ink">
                          {businessInsights.repeatability}
                        </p>
                        <p className="mt-2 text-xs leading-5 text-black/45">
                          Porównanie najlepszego dnia tydzień do tygodnia.
                        </p>
                      </article>

                      <article className="rounded-2xl border border-black/[0.06] bg-[#FAFAFC] p-4">
                        <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-black/35">
                          Tempo opinii
                        </p>
                        <p className="mt-3 text-lg font-semibold tracking-tight">
                          {businessInsights.reviewPace}
                        </p>
                        <p className="mt-2 text-xs leading-5 text-black/45">
                          Ostatnie 7 dni vs poprzednie 7 dni.
                        </p>
                      </article>

                      <article className="rounded-2xl border border-black/[0.06] bg-[#FAFAFC] p-4">
                        <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-black/35">
                          Cel miesiąca
                        </p>
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <p className="text-lg font-semibold tracking-tight">
                            {businessInsights.monthlyGoal.count} / {businessInsights.monthlyGoal.goal} opinii
                          </p>
                          {businessInsights.monthlyGoal.reached && (
                            <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                              Cel osiągnięty
                            </span>
                          )}
                        </div>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/[0.07]">
                          <div
                            className="h-full rounded-full bg-brand"
                            style={{
                              width: `${businessInsights.monthlyGoal.progress}%`,
                            }}
                          />
                        </div>
                        <p className="mt-2 text-xs leading-5 text-black/45">
                          {businessInsights.monthlyGoal.helperText}
                        </p>
                      </article>
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
                  <button type="button" className="rounded-xl border border-black/[0.08] px-3.5 py-2.5 text-xs font-semibold text-black/50">
                    Filtry
                  </button>
                  <button type="button" className="rounded-xl bg-brand-soft px-3.5 py-2.5 text-xs font-semibold text-brand">
                    Zobacz wszystkie
                  </button>
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
