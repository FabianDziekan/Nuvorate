import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/brand/logo";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { NotificationSidebarBadge } from "@/components/notifications/notification-sidebar-badge";
import { ResponseCard } from "@/components/responses/response-card";
import { ResponseSettingsCard } from "@/components/responses/response-settings-card";
import { Pagination } from "@/components/ui/pagination";
import { getPlanLabel, isPaidPlan, normalizePlan } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/dashboard/actions";

export const metadata: Metadata = {
  title: "Odpowiedzi | NuvoRate",
};

type ResponsesPageProps = {
  searchParams: Promise<{ filter?: string; page?: string }>;
};

type ResponseStatus = "pending" | "ready" | "responded";

type Review = {
  id: string;
  author_name: string;
  rating: number;
  content: string;
  created_at: string;
  response_text: string | null;
  response_status: ResponseStatus | null;
};

type ResponseSettings = {
  auto_generate: boolean | null;
  enabled_ratings: number[] | null;
};

type ResponsesIcon =
  | "analysis"
  | "bell"
  | "dashboard"
  | "logout"
  | "nfc"
  | "responses"
  | "reviews"
  | "settings";

function Icon({
  name,
  className = "h-5 w-5",
}: {
  name: ResponsesIcon;
  className?: string;
}) {
  const paths: Record<ResponsesIcon, React.ReactNode> = {
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
  };

  return (
    <svg
      aria-hidden="true"
      className={`${className} shrink-0`}
      viewBox="0 0 24 24"
      width="20"
      height="20"
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

const filters = [
  { label: "Wszystkie", value: "all" },
  { label: "Bez odpowiedzi", value: "pending" },
  { label: "Z odpowiedzią", value: "answered" },
  { label: "5★", value: "5" },
  { label: "4★", value: "4" },
  { label: "3★", value: "3" },
  { label: "2★", value: "2" },
  { label: "1★", value: "1" },
];
const reviewsPerPage = 10;

function normalizeStatus(value: string | null): ResponseStatus {
  if (value === "ready" || value === "responded") {
    return value;
  }

  return "pending";
}

function filterReviews(reviews: Review[], selectedFilter: string) {
  if (selectedFilter === "pending") {
    return reviews.filter((review) => normalizeStatus(review.response_status) === "pending");
  }

  if (selectedFilter === "answered") {
    return reviews.filter((review) =>
      ["ready", "responded"].includes(normalizeStatus(review.response_status)),
    );
  }

  if (["1", "2", "3", "4", "5"].includes(selectedFilter)) {
    return reviews.filter((review) => review.rating === Number(selectedFilter));
  }

  return reviews;
}

function buildResponsesHref(filter: string, page: number) {
  const params = new URLSearchParams();

  if (filter !== "all") {
    params.set("filter", filter);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();
  return query ? `/responses?${query}` : "/responses";
}

export default async function ResponsesPage({ searchParams }: ResponsesPageProps) {
  const params = await searchParams;
  const selectedFilter = filters.some((filter) => filter.value === params.filter)
    ? params.filter!
    : "all";
  const requestedPage = Number(params.page ?? "1");
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims) {
    redirect("/login?next=/responses");
  }

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    redirect("/login?next=/responses");
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
    throw new Error("Nie udało się odczytać danych modułu odpowiedzi.");
  }

  if (!business) {
    redirect("/onboarding");
  }

  if (!profile) {
    throw new Error("Nie znaleziono profilu użytkownika.");
  }

  const appPlan = normalizePlan(profile.plan);
  const plan = getPlanLabel(appPlan);
  const displayName = user.email?.split("@")[0] ?? "użytkowniku";

  if (!isPaidPlan(appPlan)) {
    return (
      <main className="min-h-screen bg-[#F7F7FA] text-ink">
        <div className="flex min-h-screen items-center justify-center px-5 py-12">
          <section className="w-full max-w-3xl rounded-[32px] border border-black/[0.06] bg-white p-7 text-center shadow-card sm:p-10">
            <div className="mx-auto flex justify-center">
              <BrandLogo />
            </div>
            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.14em] text-brand">
              Odpowiedzi
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Wybierz plan, aby zarządzać odpowiedziami
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-black/50">
              Generowanie i zapisywanie odpowiedzi jest dostępne po aktywacji
              planu Starter albo Business.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <Link href="/checkout?plan=starter" className="button-secondary justify-center">
                Wybierz Starter
              </Link>
              <Link href="/checkout?plan=business" className="button-primary justify-center">
                Wybierz Business
              </Link>
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

  const [
    { data: reviews, error: reviewsError },
    { data: settings, error: settingsError },
  ] = await Promise.all([
    supabase
      .from("reviews")
      .select("id, author_name, rating, content, created_at, response_text, response_status")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("business_response_settings")
      .select("auto_generate, enabled_ratings")
      .eq("business_id", business.id)
      .maybeSingle(),
  ]);

  if (reviewsError || settingsError) {
    throw new Error(
      "Nie udało się odczytać odpowiedzi. Uruchom migrację 008_review_responses.sql w Supabase.",
    );
  }

  const allReviews = (reviews ?? []) as Review[];
  const responseSettings = settings as ResponseSettings | null;
  const enabledRatings = Array.isArray(responseSettings?.enabled_ratings)
    ? responseSettings.enabled_ratings
    : [];
  const filteredReviews = filterReviews(allReviews, selectedFilter);
  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / reviewsPerPage));
  const currentPage = Number.isInteger(requestedPage)
    ? Math.min(Math.max(requestedPage, 1), totalPages)
    : 1;
  const pageStart = (currentPage - 1) * reviewsPerPage;
  const pageEnd = pageStart + reviewsPerPage;
  const paginatedReviews = filteredReviews.slice(pageStart, pageEnd);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F7F7FA] text-ink">
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
            const active = item.label === "Odpowiedzi";
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
            {plan === "Starter" && (
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

      <div className="min-w-0 lg:pl-[252px]">
        <header className="dashboard-topbar sticky top-0 z-20 border-b border-black/[0.06] bg-white/90 backdrop-blur-xl">
          <div className="flex h-[74px] min-w-0 items-center justify-between gap-4 px-5 sm:px-8 lg:px-9">
            <div className="shrink-0 lg:hidden">
              <BrandLogo />
            </div>
            <div className="hidden min-w-0 lg:block">
              <p className="truncate text-xs text-black/35">{business.name}</p>
              <p className="mt-0.5 text-sm font-semibold">Odpowiedzi</p>
            </div>
            <div className="flex min-w-0 items-center gap-2.5">
              <button
                type="button"
                className="hidden rounded-xl border border-black/[0.08] bg-white px-4 py-2.5 text-sm font-medium text-black/55 sm:block"
              >
                Wszystkie odpowiedzi
              </button>
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
          <nav
            className="flex gap-1 overflow-x-auto border-t border-black/[0.05] px-4 py-2 lg:hidden"
            aria-label="Mobilna nawigacja dashboardu"
          >
            {navigation.slice(0, 5).map((item) => {
              const active = item.label === "Odpowiedzi";
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

        <div className="min-w-0 px-5 py-8 sm:px-8 lg:px-9 lg:py-10">
          <div className="mx-auto min-w-0 max-w-[1450px]">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                  Odpowiedzi
                </h1>
                <p className="mt-2 text-sm leading-6 text-black/45">
                  Zarządzaj odpowiedziami na opinie klientów.
                </p>
              </div>
            </div>

            <ResponseSettingsCard
              businessId={business.id}
              initialAutoGenerate={Boolean(responseSettings?.auto_generate)}
              initialEnabledRatings={enabledRatings}
            />

            <section className="mt-6 rounded-[24px] border border-black/[0.06] bg-white p-5 shadow-card sm:p-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-black/35">
                    Lista odpowiedzi
                  </p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight">
                    {filteredReviews.length}{" "}
                    {filteredReviews.length === 1 ? "opinia" : "opinii"}
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2" aria-label="Filtry odpowiedzi">
                  {filters.map((filter) => {
                    const active = selectedFilter === filter.value;
                    const href =
                      filter.value === "all"
                        ? "/responses"
                        : `/responses?filter=${filter.value}`;

                    return (
                      <Link
                        key={filter.value}
                        href={href}
                        className={`rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
                          active
                            ? "bg-brand text-white shadow-sm"
                            : "border border-black/[0.08] bg-white text-black/50 hover:border-brand/30 hover:text-brand"
                        }`}
                      >
                        {filter.label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {filteredReviews.length > 0 ? (
                <div className="mt-6 space-y-3">
                  {paginatedReviews.map((review) => (
                    <ResponseCard
                      key={review.id}
                      authorName={review.author_name}
                      content={review.content}
                      createdAt={review.created_at}
                      initialResponseText={review.response_text}
                      rating={Number(review.rating)}
                      reviewId={review.id}
                      status={normalizeStatus(review.response_status)}
                    />
                  ))}
                  <Pagination
                    buildHref={(page) => buildResponsesHref(selectedFilter, page)}
                    currentPage={currentPage}
                    pageSize={reviewsPerPage}
                    totalItems={filteredReviews.length}
                  />
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-dashed border-black/[0.08] bg-[#FAFAFC] px-5 py-14 text-center">
                  <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-soft text-brand">
                    <Icon name="responses" className="h-5 w-5" />
                  </span>
                  <p className="mt-4 text-sm font-semibold">
                    Brak opinii dla wybranego filtra.
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
