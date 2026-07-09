import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AuthorVerificationList,
  type AuthorVerificationReview,
} from "@/components/author-verification/author-verification-list";
import { BrandLogo } from "@/components/brand/logo";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { NotificationSidebarBadge } from "@/components/notifications/notification-sidebar-badge";
import { Pagination } from "@/components/ui/pagination";
import {
  RatingFilter,
  ratingFilterValues,
} from "@/components/ui/rating-filter";
import { getPlanLabel, normalizePlan } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/dashboard/actions";

export const metadata: Metadata = {
  title: "Weryfikacja autora | NuvoRate",
};

type AuthorVerificationIcon =
  | "analysis"
  | "bell"
  | "dashboard"
  | "logout"
  | "nfc"
  | "responses"
  | "reviews"
  | "settings"
  | "verification";

function Icon({
  name,
  className = "h-5 w-5",
}: {
  name: AuthorVerificationIcon;
  className?: string;
}) {
  const paths: Record<AuthorVerificationIcon, React.ReactNode> = {
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
  {
    label: "Weryfikacja autora",
    icon: "verification" as const,
    href: "/author-verification",
  },
  { label: "NFC", icon: "nfc" as const, href: "/nfc" },
  { label: "Powiadomienia", icon: "bell" as const, href: "/notifications" },
  { label: "Ustawienia", icon: "settings" as const, href: "/settings" },
];

type ReviewRow = {
  id: string;
  author_name: string;
  rating: number;
  content: string;
  created_at: string;
  source: string | null;
};

type AuthorVerificationPageProps = {
  searchParams: Promise<{
    page?: string;
    q?: string;
    rating?: string;
    sort?: string;
    status?: string;
  }>;
};

const authorVerificationPerPage = 10;
const statusFilters = ["all", "unverified", "verified"] as const;
const sortOptions = ["newest", "oldest", "lowest", "highest"] as const;

function buildAuthorVerificationHref({
  page = 1,
  q,
  rating,
  sort,
  status,
}: {
  page?: number;
  q: string;
  rating: string;
  sort: string;
  status: string;
}) {
  const params = new URLSearchParams();

  if (q) {
    params.set("q", q);
  }

  if (rating !== "all") {
    params.set("rating", rating);
  }

  if (status !== "all") {
    params.set("status", status);
  }

  if (sort !== "newest") {
    params.set("sort", sort);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();
  return query ? `/author-verification?${query}` : "/author-verification";
}

export default async function AuthorVerificationPage({
  searchParams,
}: AuthorVerificationPageProps) {
  const params = await searchParams;
  const selectedRating = ratingFilterValues.includes(
    params.rating as (typeof ratingFilterValues)[number],
  )
    ? params.rating!
    : "all";
  const selectedStatus = statusFilters.includes(
    params.status as (typeof statusFilters)[number],
  )
    ? params.status!
    : "all";
  const selectedSort = sortOptions.includes(
    params.sort as (typeof sortOptions)[number],
  )
    ? params.sort!
    : "newest";
  const searchQuery = typeof params.q === "string" ? params.q.trim() : "";
  const requestedPage = Number(params.page ?? "1");
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims) {
    redirect("/login?next=/author-verification");
  }

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    redirect("/login?next=/author-verification");
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
      .select("first_name, plan")
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
    throw new Error("Nie znaleziono profilu użytkownika.");
  }

  const { data: reviews, error: reviewsError } = await supabase
    .from("reviews")
    .select("id, author_name, rating, content, created_at, source")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });

  if (reviewsError) {
    throw new Error(
      "Nie udało się odczytać opinii. Sprawdź konfigurację Supabase.",
    );
  }

  const appPlan = normalizePlan(profile.plan);
  const plan = getPlanLabel(appPlan);
  const firstName =
    typeof profile.first_name === "string" ? profile.first_name.trim() : "";
  const displayName = firstName || user.email || "NU";
  const allVerificationReviews: AuthorVerificationReview[] = (
    (reviews ?? []) as ReviewRow[]
  ).map((review) => ({
    authorName: review.author_name,
    authorProfileUrl: null,
    content: review.content,
    createdAt: review.created_at,
    id: review.id,
    rating: Number(review.rating),
    source: review.source ?? "google",
    verificationStatus: "unverified",
  }));
  const normalizedSearchQuery = searchQuery.toLowerCase();
  const filteredReviews = allVerificationReviews
    .filter((review) => {
      if (selectedRating !== "all" && review.rating !== Number(selectedRating)) {
        return false;
      }

      if (
        selectedStatus !== "all" &&
        review.verificationStatus !== selectedStatus
      ) {
        return false;
      }

      if (!normalizedSearchQuery) {
        return true;
      }

      return (
        review.authorName.toLowerCase().includes(normalizedSearchQuery) ||
        review.content.toLowerCase().includes(normalizedSearchQuery)
      );
    })
    .sort((firstReview, secondReview) => {
      if (selectedSort === "oldest") {
        return (
          new Date(firstReview.createdAt).getTime() -
          new Date(secondReview.createdAt).getTime()
        );
      }

      if (selectedSort === "lowest") {
        return firstReview.rating - secondReview.rating;
      }

      if (selectedSort === "highest") {
        return secondReview.rating - firstReview.rating;
      }

      return (
        new Date(secondReview.createdAt).getTime() -
        new Date(firstReview.createdAt).getTime()
      );
    });
  const totalPages = Math.max(
    1,
    Math.ceil(filteredReviews.length / authorVerificationPerPage),
  );
  const currentPage = Number.isInteger(requestedPage)
    ? Math.min(Math.max(requestedPage, 1), totalPages)
    : 1;
  const pageStart = (currentPage - 1) * authorVerificationPerPage;
  const pageEnd = pageStart + authorVerificationPerPage;
  const paginatedReviews = filteredReviews.slice(pageStart, pageEnd);
  const buildHref = (page: number) =>
    buildAuthorVerificationHref({
      page,
      q: searchQuery,
      rating: selectedRating,
      sort: selectedSort,
      status: selectedStatus,
    });

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
            const active = item.label === "Weryfikacja autora";
            const className = `sidebar-nav-item flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition ${
              active
                ? "bg-brand-soft text-brand"
                : "text-black/45 hover:bg-black/[0.035] hover:text-ink"
            }`;

            return (
              <Link key={item.label} href={item.href} className={className}>
                <Icon name={item.icon} className="h-[18px] w-[18px]" />
                <span className="min-w-0 flex-1">{item.label}</span>
                {item.label === "Powiadomienia" ? (
                  <NotificationSidebarBadge businessId={business.id} />
                ) : null}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto">
          <div className="rounded-2xl bg-ink p-4 text-white">
            <p className="text-[11px] text-white/45">Aktywny plan</p>
            <div className="mt-1 flex items-center justify-between">
              <p className="font-semibold">{plan}</p>
              <span className="rounded-full bg-brand px-2 py-1 text-[9px] font-semibold uppercase tracking-wider">
                konto
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
              <p className="mt-0.5 text-sm font-semibold">
                Weryfikacja autora
              </p>
            </div>
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="hidden rounded-xl border border-brand/20 bg-brand-soft px-4 py-2.5 text-sm font-semibold text-brand sm:block">
                Business Feature
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
          <nav
            className="flex gap-1 overflow-x-auto border-t border-black/[0.05] px-4 py-2 lg:hidden"
            aria-label="Mobilna nawigacja dashboardu"
          >
            {navigation.slice(0, 5).map((item) => {
              const active = item.label === "Weryfikacja autora";
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium ${
                    active ? "bg-brand-soft text-brand" : "text-black/40"
                  }`}
                >
                  <Icon name={item.icon} className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>

        <div className="min-w-0 px-5 py-8 sm:px-8 lg:px-9 lg:py-10">
          <div className="mx-auto min-w-0 max-w-[1450px]">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
                    Weryfikacja opinii
                  </p>
                  <span className="rounded-full border border-brand/20 bg-brand-soft px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-brand">
                    Business Feature
                  </span>
                </div>
                <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                  Weryfikacja autora
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-black/45">
                  Sprawdzaj autorów opinii i przygotuj się na przyszłą
                  integrację z publicznym profilem Google autora.
                </p>
              </div>
            </div>

            <section className="mt-8 min-w-0 overflow-hidden rounded-[24px] border border-black/[0.06] bg-white p-5 shadow-card sm:p-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-black/35">
                    Lista opinii
                  </p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight">
                    {filteredReviews.length}{" "}
                    {filteredReviews.length === 1 ? "autor" : "autorów"}
                  </h2>
                </div>
                <p className="max-w-md text-sm leading-6 text-black/45">
                  Kliknij opinię albo przycisk „Sprawdź autora”, aby otworzyć
                  panel weryfikacji.
                </p>
              </div>

              <div className="mt-6 rounded-2xl border border-black/[0.06] bg-[#FAFAFC] p-4">
                <div className="grid gap-4 xl:grid-cols-[1fr_260px]">
                  <form action="/author-verification" className="min-w-0">
                    <input type="hidden" name="rating" value={selectedRating} />
                    <input type="hidden" name="status" value={selectedStatus} />
                    <label className="block">
                      <span className="text-xs font-semibold text-black/45">
                        Wyszukiwarka
                      </span>
                      <div className="mt-2 flex gap-2">
                        <input
                          name="q"
                          defaultValue={searchQuery}
                          placeholder="Szukaj autora..."
                          className="w-full rounded-2xl border border-black/[0.08] bg-white px-4 py-3 text-sm outline-none transition focus:border-brand/30 focus:ring-4 focus:ring-brand/10"
                        />
                        <button
                          type="submit"
                          className="rounded-2xl bg-brand px-4 py-3 text-xs font-semibold text-white transition hover:bg-[#4D4EE8]"
                        >
                          Szukaj
                        </button>
                      </div>
                    </label>
                  </form>

                  <form action="/author-verification">
                    <input type="hidden" name="q" value={searchQuery} />
                    <input type="hidden" name="rating" value={selectedRating} />
                    <input type="hidden" name="status" value={selectedStatus} />
                    <label className="block">
                      <span className="text-xs font-semibold text-black/45">
                        Sortowanie
                      </span>
                      <select
                        name="sort"
                        defaultValue={selectedSort}
                        className="mt-2 w-full rounded-2xl border border-black/[0.08] bg-white px-4 py-3 text-sm outline-none transition focus:border-brand/30 focus:ring-4 focus:ring-brand/10"
                      >
                        <option value="newest">Najnowsze</option>
                        <option value="oldest">Najstarsze</option>
                        <option value="lowest">Najniższa ocena</option>
                        <option value="highest">Najwyższa ocena</option>
                      </select>
                      <button
                        type="submit"
                        className="mt-2 w-full rounded-xl border border-black/[0.08] bg-white px-4 py-2.5 text-xs font-semibold text-black/55 transition hover:border-brand/30 hover:text-brand"
                      >
                        Zastosuj
                      </button>
                    </label>
                  </form>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold text-black/45">
                      Ocena
                    </p>
                    <div className="mt-2">
                      <RatingFilter
                        selectedRating={selectedRating}
                        buildHref={(rating) =>
                          buildAuthorVerificationHref({
                            q: searchQuery,
                            rating,
                            sort: selectedSort,
                            status: selectedStatus,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-black/45">
                      Status
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {[
                        { label: "Wszystkie", value: "all" },
                        { label: "Niezweryfikowane", value: "unverified" },
                        { label: "Zweryfikowane", value: "verified" },
                      ].map((status) => {
                        const active = selectedStatus === status.value;
                        const href = buildAuthorVerificationHref({
                          q: searchQuery,
                          rating: selectedRating,
                          sort: selectedSort,
                          status: status.value,
                        });

                        return (
                          <Link
                            key={status.value}
                            href={href}
                            className={`rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
                              active
                                ? "bg-brand text-white shadow-sm"
                                : "border border-black/[0.08] bg-white text-black/50 hover:border-brand/30 hover:text-brand"
                            }`}
                          >
                            {status.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <AuthorVerificationList reviews={paginatedReviews} />
              </div>

              <div className="mt-6">
                <Pagination
                  buildHref={buildHref}
                  currentPage={currentPage}
                  itemLabel="autorów"
                  pageSize={authorVerificationPerPage}
                  totalItems={filteredReviews.length}
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
