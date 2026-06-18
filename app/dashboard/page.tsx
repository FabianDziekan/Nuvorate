import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/brand/logo";
import { createClient } from "@/lib/supabase/server";
import {
  generateBusinessAnalysis,
  generateReviewResponse,
  signOut,
} from "./actions";

export const metadata: Metadata = {
  title: "Dashboard | NuvoRate",
};

type DashboardIcon =
  | "analysis"
  | "bell"
  | "dashboard"
  | "logout"
  | "nfc"
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
  { label: "NFC", icon: "nfc" as const },
  { label: "Powiadomienia", icon: "bell" as const },
  { label: "Ustawienia", icon: "settings" as const },
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
  response_text: string;
};

type BusinessAnalysis = {
  created_at: string;
  review_count: number;
  summary: string;
  praised_elements: unknown;
  reported_problems: unknown;
  recommendations: unknown;
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

function TrendChart() {
  return (
    <div className="mt-5 h-52 w-full">
      <svg
        className="h-full w-full overflow-visible"
        viewBox="0 0 720 220"
        preserveAspectRatio="none"
        role="img"
        aria-label="Trend nowych opinii z ostatnich 30 dni"
      >
        <defs>
          <linearGradient id="dashboardArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5B5CF6" stopOpacity=".22" />
            <stop offset="100%" stopColor="#5B5CF6" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[30, 80, 130, 180].map((y) => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="720"
            y2={y}
            stroke="#0F0F10"
            strokeOpacity=".06"
            strokeDasharray="4 7"
          />
        ))}
        <path
          d="M0 176 C65 168,88 146,142 154 S220 127,280 133 S360 102,420 111 S506 76,565 88 S645 45,720 36 L720 220 L0 220 Z"
          fill="url(#dashboardArea)"
        />
        <path
          d="M0 176 C65 168,88 146,142 154 S220 127,280 133 S360 102,420 111 S506 76,565 88 S645 45,720 36"
          fill="none"
          stroke="#5B5CF6"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {[
          [142, 154],
          [280, 133],
          [420, 111],
          [565, 88],
          [720, 36],
        ].map(([x, y]) => (
          <circle key={x} cx={x} cy={y} r="6" fill="white" stroke="#5B5CF6" strokeWidth="4" />
        ))}
      </svg>
    </div>
  );
}

export default async function DashboardPage() {
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
      .select("plan")
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

  const [
    { data: reviews, error: reviewsError },
    {
      data: reviewRatings,
      count: reviewsCount,
      error: reviewStatsError,
    },
  ] = await Promise.all([
    supabase
      .from("reviews")
      .select("id, author_name, rating, content, created_at")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("reviews")
      .select("rating", { count: "exact" })
      .eq("business_id", business.id),
  ]);

  if (reviewsError || reviewStatsError) {
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
      "Nie udało się odczytać danych AI. Uruchom migrację 003_ai_features.sql w Supabase.",
    );
  }

  const ratings = reviewRatings.map((review) => Number(review.rating));
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
      value: "148",
      change: "+32%",
      detail: "vs poprzednie 30 dni",
      placeholder: "Placeholder • NFC",
      icon: "nfc" as const,
    },
  ];

  const businessName = business.name ?? "Twoja firma";
  const businessIndustry = business.industry ?? "Branża nieuzupełniona";
  const businessCity = business.city ?? "Miasto nieuzupełnione";
  const plan = profile.plan === "business" ? "Business" : "Starter";
  const displayName = user.email?.split("@")[0] ?? "użytkowniku";
  const responsesByReviewId = new Map(
    (reviewResponses as ReviewResponse[]).map((response) => [
      response.review_id,
      response.response_text,
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
    <main className="min-h-screen bg-[#F6F6F9] text-ink">
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
            const className = `flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition ${
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
                  {item.label}
                </Link>
              );
            }

            return (
              <button key={item.label} type="button" className={className}>
                <Icon name={item.icon} className="h-[18px] w-[18px]" />
                {item.label}
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
            {plan === "Starter" && (
              <button type="button" className="mt-4 w-full rounded-xl bg-white/10 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-white/15">
                Przejdź na Business
              </button>
            )}
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
        <header className="sticky top-0 z-20 border-b border-black/[0.06] bg-white/90 backdrop-blur-xl">
          <div className="flex h-[74px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-9">
            <div className="lg:hidden">
              <BrandLogo />
            </div>
            <div className="hidden lg:block">
              <p className="text-xs text-black/35">{businessName}</p>
              <p className="mt-0.5 text-sm font-semibold">Pulpit główny</p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                className="hidden rounded-xl border border-black/[0.08] bg-white px-4 py-2.5 text-sm font-medium text-black/55 sm:block"
              >
                Ostatnie 30 dni
              </button>
              <button
                type="button"
                className="relative grid h-11 w-11 place-items-center rounded-xl border border-black/[0.08] bg-white text-black/50"
                aria-label="Powiadomienia"
              >
                <Icon name="bell" className="h-[18px] w-[18px]" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-brand" />
              </button>
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
              {metrics.map((metric) => (
                <article key={metric.label} className="rounded-[22px] border border-black/[0.06] bg-white p-5 shadow-card">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-black/40">{metric.label}</p>
                      {"placeholder" in metric && (
                        <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-brand/70">
                          {metric.placeholder}
                        </p>
                      )}
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

            <section className="mt-4 grid gap-4 xl:grid-cols-[1.55fr_0.75fr]">
              <article className="rounded-[24px] border border-black/[0.06] bg-white p-5 shadow-card sm:p-6">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.12em] text-black/35">
                      Nowe opinie
                    </p>
                    <h2 className="mt-1 text-xl font-semibold tracking-tight">Trend reputacji</h2>
                  </div>
                  <div className="flex gap-4 text-xs">
                    <span className="flex items-center gap-2 text-black/50">
                      <span className="h-2 w-2 rounded-full bg-brand" />
                      Bieżący okres
                    </span>
                    <span className="flex items-center gap-2 text-black/30">
                      <span className="h-2 w-2 rounded-full bg-black/15" />
                      Poprzedni okres
                    </span>
                  </div>
                </div>
                <TrendChart />
                <div className="flex justify-between text-[10px] text-black/25">
                  <span>1 maj</span>
                  <span>8 maj</span>
                  <span>15 maj</span>
                  <span>22 maj</span>
                  <span>30 maj</span>
                </div>
              </article>

              <article className="relative overflow-hidden rounded-[24px] bg-ink p-6 text-white shadow-card">
                <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-brand/25 blur-3xl" />
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.12em] text-white/40">
                      Inteligentna analiza
                    </p>
                    <h2 className="mt-1 text-xl font-semibold">Analiza ostatnich 30 dni</h2>
                  </div>
                  <span className="rounded-full bg-brand/20 px-2.5 py-1 text-[10px] font-semibold text-[#B6B7FF]">
                    BUSINESS
                  </span>
                </div>
                {plan === "Business" ? (
                  latestAnalysis ? (
                    <div className="relative mt-6">
                      <p className="text-sm leading-6 text-white/70">
                        {latestAnalysis.summary}
                      </p>
                      <div className="mt-5 space-y-4 text-xs">
                        <div>
                          <p className="font-semibold text-[#B6B7FF]">
                            Najczęściej chwalone
                          </p>
                          <ul className="mt-2 space-y-1.5 text-white/55">
                            {praisedElements.map((item) => (
                              <li key={item}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="font-semibold text-[#B6B7FF]">
                            Najczęściej zgłaszane problemy
                          </p>
                          <ul className="mt-2 space-y-1.5 text-white/55">
                            {reportedProblems.map((item) => (
                              <li key={item}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="font-semibold text-[#B6B7FF]">
                            Rekomendacje działań
                          </p>
                          <ul className="mt-2 space-y-1.5 text-white/55">
                            {recommendations.map((item) => (
                              <li key={item}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <p className="mt-5 text-[10px] text-white/35">
                        {latestAnalysis.review_count} opinii •{" "}
                        {new Date(latestAnalysis.created_at).toLocaleDateString(
                          "pl-PL",
                        )}
                      </p>
                    </div>
                  ) : (
                    <p className="relative mt-6 text-sm leading-6 text-white/65">
                      Wygeneruj pierwszą analizę opinii z ostatnich 30 dni.
                    </p>
                  )
                ) : (
                  <p className="relative mt-6 text-sm leading-6 text-white/65">
                    Analiza wszystkich opinii, trendów i rekomendacji jest
                    dostępna w planie Business.
                  </p>
                )}
                {plan === "Business" && (
                  <form action={generateBusinessAnalysis} className="relative mt-6">
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-brand px-4 py-3 text-xs font-semibold text-white transition hover:bg-[#4D4EE8]"
                    >
                      {latestAnalysis ? "Odśwież analizę" : "Wygeneruj analizę"}
                    </button>
                  </form>
                )}
              </article>
            </section>

            <section className="mt-4 rounded-[24px] border border-black/[0.06] bg-white p-5 shadow-card sm:p-6">
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
              {reviews.length > 0 ? (
                <div className="mt-5 grid gap-3 lg:grid-cols-3">
                  {(reviews as Review[]).map((review) => (
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
                      {responsesByReviewId.has(review.id) && (
                        <div className="mt-4 rounded-xl border border-brand/10 bg-white p-3">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-brand">
                            Proponowana odpowiedź
                          </p>
                          <p className="mt-2 text-xs leading-5 text-black/55">
                            {responsesByReviewId.get(review.id)}
                          </p>
                        </div>
                      )}
                      <form action={generateReviewResponse} className="mt-4">
                        <input type="hidden" name="reviewId" value={review.id} />
                        <button type="submit" className="text-xs font-semibold text-brand">
                          {responsesByReviewId.has(review.id)
                            ? "Wygeneruj ponownie"
                            : "Wygeneruj odpowiedź"}
                        </button>
                      </form>
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
