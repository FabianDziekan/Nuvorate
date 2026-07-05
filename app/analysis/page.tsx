import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/brand/logo";
import { AnalysisActionForm } from "@/components/dashboard/analysis-action-form";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { NotificationSidebarBadge } from "@/components/notifications/notification-sidebar-badge";
import { getPlanLabel, isPaidPlan, normalizePlan } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/dashboard/actions";

export const metadata: Metadata = {
  title: "Analiza reputacji | NuvoRate",
};

type AnalysisIcon =
  | "analysis"
  | "arrowDown"
  | "arrowRight"
  | "arrowUp"
  | "bell"
  | "check"
  | "dashboard"
  | "logout"
  | "nfc"
  | "responses"
  | "reviews"
  | "settings"
  | "warning";

type BusinessAnalysis = {
  created_at: string;
  period_start: string;
  period_end: string;
  review_count: number;
  score: number | null;
  trend: "up" | "down" | "stable" | null;
  summary: string;
  praised_elements: unknown;
  reported_problems: unknown;
  recommendations: unknown;
};

type LegacyBusinessAnalysis = Omit<BusinessAnalysis, "score" | "trend">;

function Icon({
  name,
  className = "h-5 w-5",
}: {
  name: AnalysisIcon;
  className?: string;
}) {
  const paths: Record<AnalysisIcon, React.ReactNode> = {
    analysis: (
      <>
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <path d="m7 15 4-4 3 2 5-7" />
      </>
    ),
    arrowDown: (
      <>
        <path d="M12 5v14" />
        <path d="m18 13-6 6-6-6" />
      </>
    ),
    arrowRight: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),
    arrowUp: (
      <>
        <path d="M12 19V5" />
        <path d="m6 11 6-6 6 6" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),
    check: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 2.5 2.5L16 9" />
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
    warning: (
      <>
        <path d="M10.3 3.8 2.2 18a2 2 0 0 0 1.7 3h16.2a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
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
  { label: "Pulpit", icon: "dashboard" as const, href: "/dashboard" },
  { label: "Opinie", icon: "reviews" as const, href: "/reviews" },
  { label: "Analiza", icon: "analysis" as const, href: "/analysis" },
  { label: "Odpowiedzi", icon: "responses" as const, href: "/responses" },
  { label: "NFC", icon: "nfc" as const, href: "/nfc" },
  { label: "Powiadomienia", icon: "bell" as const, href: "/notifications" },
  { label: "Ustawienia", icon: "settings" as const, href: "/settings" },
];

function stringList(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function isMissingScoreTrendColumnError(error: { message?: string; code?: string }) {
  const message = error.message ?? "";

  return (
    error.code === "42703" ||
    error.code === "PGRST204" ||
    message.includes("score") ||
    message.includes("trend")
  );
}

const trendDetails = {
  up: {
    label: "Trend wzrostowy",
    description: "Reputacja poprawia się w porównaniu z początkiem okresu.",
    icon: "arrowUp" as const,
    className: "bg-emerald-50 text-emerald-700",
  },
  down: {
    label: "Trend spadkowy",
    description: "Najnowsze opinie sygnalizują pogorszenie reputacji.",
    icon: "arrowDown" as const,
    className: "bg-red-50 text-red-600",
  },
  stable: {
    label: "Trend stabilny",
    description: "Reputacja pozostaje na zbliżonym poziomie.",
    icon: "arrowRight" as const,
    className: "bg-amber-50 text-amber-700",
  },
};

export default async function AnalysisPage({
  searchParams,
}: {
  searchParams: Promise<{ ai_error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims) {
    redirect("/login?next=/analysis");
  }

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    redirect("/login?next=/analysis");
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
    throw new Error("Nie udało się odczytać danych firmy lub profilu.");
  }

  if (!business) {
    redirect("/onboarding");
  }

  if (!profile) {
    throw new Error("Nie znaleziono profilu użytkownika.");
  }

  const appPlan = normalizePlan(profile.plan);
  const isBusiness = appPlan === "business";
  const isPaid = isPaidPlan(appPlan);
  let analysis: BusinessAnalysis | null = null;

  if (isPaid) {
    const selectLatestAnalysis = (columns: string) =>
      supabase
        .from("ai_business_analyses")
        .select(columns)
        .eq("business_id", business.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    const result = await selectLatestAnalysis(
      "created_at, period_start, period_end, review_count, score, trend, summary, praised_elements, reported_problems, recommendations",
    );
    let data: BusinessAnalysis | null = result.data as BusinessAnalysis | null;
    let error = result.error;

    if (error && isMissingScoreTrendColumnError(error)) {
      console.warn(
        "ai_business_analyses score/trend columns are missing; rendering analysis empty state.",
        error,
      );

      const legacyResult = await selectLatestAnalysis(
        "created_at, period_start, period_end, review_count, summary, praised_elements, reported_problems, recommendations",
      );
      const legacyData = legacyResult.data as LegacyBusinessAnalysis | null;

      data = legacyData
        ? {
            ...legacyData,
            score: null,
            trend: null,
          }
        : null;
      error = legacyResult.error;
    }

    if (error) {
      throw new Error(
        `Nie udało się odczytać analizy: ${error.message}`,
      );
    }

    analysis = data as BusinessAnalysis | null;
  }

  const plan = getPlanLabel(appPlan);
  const displayName = user.email?.split("@")[0] ?? "użytkowniku";
  const strengths = stringList(analysis?.praised_elements);
  const problems = stringList(analysis?.reported_problems);
  const recommendations = stringList(analysis?.recommendations);
  const completeAnalysis =
    analysis !== null &&
    typeof analysis.score === "number" &&
    analysis.trend !== null
      ? analysis
      : null;
  const score = completeAnalysis?.score ?? 0;
  const trend = completeAnalysis?.trend
    ? trendDetails[completeAnalysis.trend]
    : trendDetails.stable;

  return (
    <main className="min-h-screen bg-[#F7F7FA] text-ink">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[252px] flex-col border-r border-black/[0.06] bg-white px-5 py-6 lg:flex">
        <BrandLogo />
        <div className="mt-9 rounded-2xl border border-black/[0.06] bg-[#FAFAFC] p-3.5">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-black/35">
            Twoja firma
          </p>
          <p className="mt-1.5 truncate font-semibold">{business.name}</p>
          <p className="mt-2 truncate text-xs text-black/40">
            {business.industry ?? "Branża nieuzupełniona"}
          </p>
          <p className="mt-1 truncate text-xs text-black/40">
            {business.city ?? "Miasto nieuzupełnione"}
          </p>
          <p className="mt-2 text-[11px] font-semibold text-brand">
            Plan {plan}
          </p>
        </div>
        <nav className="mt-7 space-y-1.5" aria-label="Nawigacja dashboardu">
          {navigation.map((item) => {
            const active = item.label === "Analiza";
            const className = `sidebar-nav-item flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition ${
              active
                ? "bg-brand-soft text-brand"
                : "text-black/45 hover:bg-black/[0.035] hover:text-ink"
            }`;

            if (item.href) {
              return (
                <Link key={item.label} href={item.href} className={className}>
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
            {!isBusiness && (
              <Link href="/checkout?plan=business" className="mt-4 block w-full rounded-xl bg-white/10 px-3 py-2.5 text-center text-xs font-semibold text-white transition hover:bg-white/15">
                Przejdź na Business
              </Link>
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
              <p className="text-xs text-black/35">{business.name}</p>
              <p className="mt-0.5 text-sm font-semibold">Analiza reputacji</p>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="hidden rounded-xl border border-black/[0.08] bg-white px-4 py-2.5 text-sm font-medium text-black/55 sm:block">
                Ostatnie 30 dni
              </span>
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
            {navigation.slice(0, 5).map((item) => {
              const active = item.label === "Analiza";
              const className = `flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium ${
                active ? "bg-brand-soft text-brand" : "text-black/40"
              }`;

              if (item.href) {
                return (
                  <Link key={item.label} href={item.href} className={className}>
                    <Icon name={item.icon} className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              }

              return (
                <button key={item.label} type="button" className={className}>
                  <Icon name={item.icon} className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </header>

        <div className="px-5 py-8 sm:px-8 lg:px-9 lg:py-10">
          <div className="mx-auto max-w-[1450px]">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
                  Business Intelligence
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                  Analiza reputacji
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-black/45">
                  Konsultingowe podsumowanie opinii klientów firmy{" "}
                  {business.name} z ostatnich 30 dni.
                </p>
              </div>
              {isPaid && (
                <AnalysisActionForm
                  hasSummary={Boolean(completeAnalysis)}
                  redirectTo="/analysis"
                />
              )}
            </div>

            {params.ai_error && (
              <div className="mt-8 flex flex-col gap-3 rounded-[22px] border border-brand/15 bg-brand-soft p-5 text-sm font-semibold text-brand shadow-card sm:flex-row sm:items-center sm:justify-between">
                <span>{params.ai_error}</span>
                {appPlan === "starter" && (
                  <Link href="/checkout?plan=business" className="rounded-xl bg-brand px-4 py-2.5 text-center text-xs font-semibold text-white transition hover:bg-[#4D4EE8]">
                    Przejdź na Business
                  </Link>
                )}
              </div>
            )}

            {!isPaid ? (
              <section className="mt-8 overflow-hidden rounded-[28px] bg-ink p-7 text-white shadow-card sm:p-10">
                <div className="max-w-2xl">
                  <span className="inline-flex rounded-full bg-brand/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#B6B7FF]">
                    Wybierz plan
                  </span>
                  <h2 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">
                    Aktywuj plan, aby korzystać z analizy reputacji.
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-white/60">
                    Analizy reputacji są dostępne po zakupie planu Starter
                    albo Business. Starter obejmuje 1 analizę miesięcznie,
                    Business 50 analiz miesięcznie.
                  </p>
                  <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    <Link href="/checkout?plan=starter" className="button-secondary bg-white text-ink hover:bg-white/90">
                      Wybierz Starter
                    </Link>
                    <Link href="/checkout?plan=business" className="button-primary">
                      Wybierz Business
                    </Link>
                  </div>
                </div>
              </section>
            ) : completeAnalysis ? (
              <>
                <section className="mt-8 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
                  <article className="relative overflow-hidden rounded-[28px] bg-ink p-7 text-white shadow-card">
                    <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand/30 blur-3xl" />
                    <div className="relative">
                      <p className="text-xs font-medium uppercase tracking-[0.12em] text-white/40">
                        Reputation Score
                      </p>
                      <div className="mt-7 flex items-center gap-6">
                        <div
                          className="grid h-36 w-36 shrink-0 place-items-center rounded-full p-3"
                          style={{
                            background: `conic-gradient(#5B5CF6 ${score}%, rgba(255,255,255,.1) ${score}% 100%)`,
                          }}
                        >
                          <div className="grid h-full w-full place-items-center rounded-full bg-ink">
                            <div className="text-center">
                              <p className="text-4xl font-semibold tracking-[-0.05em]">
                                {score}
                              </p>
                              <p className="mt-1 text-[10px] uppercase tracking-wider text-white/35">
                                na 100
                              </p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="text-lg font-semibold">
                            Ocena reputacji firmy
                          </p>
                          <p className="mt-2 text-xs leading-5 text-white/50">
                            Wynik uwzględnia oceny, sentyment i powtarzalność
                            tematów w opiniach.
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>

                  <article className="rounded-[28px] border border-black/[0.06] bg-white p-7 shadow-card">
                    <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-[0.12em] text-black/35">
                          Trend
                        </p>
                        <div className={`mt-4 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${trend.className}`}>
                          <Icon name={trend.icon} className="h-4 w-4" />
                          {trend.label}
                        </div>
                        <p className="mt-4 max-w-md text-sm leading-6 text-black/50">
                          {trend.description}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-[#FAFAFC] px-4 py-3 text-right">
                        <p className="text-[10px] uppercase tracking-[0.1em] text-black/30">
                          Zakres raportu
                        </p>
                        <p className="mt-1 text-xs font-semibold">
                          {formatDate(completeAnalysis.period_start)} –{" "}
                          {formatDate(completeAnalysis.period_end)}
                        </p>
                        <p className="mt-1 text-[11px] text-black/35">
                          {completeAnalysis.review_count} opinii
                        </p>
                      </div>
                    </div>
                  </article>
                </section>

                <section className="mt-4 rounded-[28px] border border-black/[0.06] bg-white p-6 shadow-card sm:p-8">
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-black/35">
                    Executive Summary
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                    Najważniejsze wnioski
                  </h2>
                  <p className="mt-5 max-w-4xl text-sm leading-7 text-black/60">
                    {completeAnalysis.summary}
                  </p>
                </section>

                <section className="mt-4 grid gap-4 xl:grid-cols-3">
                  {[
                    {
                      title: "Mocne strony",
                      eyebrow: "Strengths",
                      items: strengths,
                      icon: "check" as const,
                      iconClass: "bg-emerald-50 text-emerald-700",
                    },
                    {
                      title: "Problemy",
                      eyebrow: "Weaknesses",
                      items: problems,
                      icon: "warning" as const,
                      iconClass: "bg-red-50 text-red-600",
                    },
                    {
                      title: "Rekomendacje",
                      eyebrow: "Action plan",
                      items: recommendations,
                      icon: "analysis" as const,
                      iconClass: "bg-brand-soft text-brand",
                    },
                  ].map((section) => (
                    <article key={section.title} className="rounded-[24px] border border-black/[0.06] bg-white p-6 shadow-card">
                      <div className="flex items-start gap-3">
                        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${section.iconClass}`}>
                          <Icon name={section.icon} className="h-[18px] w-[18px]" />
                        </span>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-black/30">
                            {section.eyebrow}
                          </p>
                          <h2 className="mt-1 text-lg font-semibold">
                            {section.title}
                          </h2>
                        </div>
                      </div>
                      <ul className="mt-6 space-y-3">
                        {section.items.map((item) => (
                          <li key={item} className="flex gap-3 rounded-2xl bg-[#FAFAFC] p-4 text-sm leading-6 text-black/55">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </section>

                <p className="mt-5 text-center text-[11px] text-black/30">
                  Ostatnia aktualizacja:{" "}
                  {formatDate(completeAnalysis.created_at)}
                </p>
              </>
            ) : (
              <section className="mt-8 rounded-[28px] border border-dashed border-black/[0.1] bg-white px-6 py-16 text-center shadow-card">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-soft text-brand">
                  <Icon name="analysis" className="h-6 w-6" />
                </span>
                <h2 className="mt-5 text-xl font-semibold">
                  Brak wygenerowanej analizy
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-black/45">
                  Wygeneruj raport, aby zobaczyć wynik reputacji, trend, mocne
                  strony, problemy i rekomendacje działań.
                </p>
              </section>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
