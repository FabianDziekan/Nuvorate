import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { AUTHOR_PROFILES_ENABLED } from "@/lib/author-profiles-launch";
import {
  AuthorVerificationList,
  type AuthorVerificationReview,
} from "@/components/author-verification/author-verification-list";
import { MobileBottomNavigation } from "@/components/navigation/mobile-bottom-navigation";
import { AppNavigationIcon } from "@/components/navigation/app-navigation-icon";
import { BrandLogo } from "@/components/brand/logo";
import { DesktopBusinessSwitcher } from "@/components/business/desktop-business-switcher";
import { BusinessFeatureLock } from "@/components/billing/business-feature-lock";
import { BusinessNavBadge } from "@/components/billing/business-nav-badge";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { NotificationSidebarBadge } from "@/components/notifications/notification-sidebar-badge";
import {
  getPlanLabel,
  hasPlanCapability,
} from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";
import { getActiveBusinessBillingContext } from "@/lib/active-business-billing";
import { getDashboardNotifications } from "@/lib/dashboard-notifications";
import { signOut } from "@/app/dashboard/actions";

export const metadata: Metadata = {
  title: "Autorzy opinii | NuvoRate",
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
        <path d="M3.5 9a12 12 0 0 1 17 0" />
        <path d="M6.75 12.5a7.5 7.5 0 0 1 10.5 0" />
        <path d="M10 16a3 3 0 0 1 4 0" />
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
  { label: "NFC", icon: "nfc" as const, href: "/nfc" },
  { label: "Powiadomienia", icon: "bell" as const, href: "/notifications" },
  { label: "Ustawienia", icon: "settings" as const, href: "/settings" },
  { label: "Pomoc i kontakt", icon: "help" as const, href: "/support" },
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

export default async function AuthorVerificationPage() {
  if (!AUTHOR_PROFILES_ENABLED) notFound();
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
    billingContext,
    { data: profile, error: profileError },
  ] = await Promise.all([
    getActiveBusinessBillingContext(supabase, user.id, "id, name, industry, city"),
    supabase
      .from("profiles")
      .select("first_name")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const business = billingContext?.activeBusiness.business;

  if (profileError) {
    throw new Error(
      "Nie udało się odczytać danych firmy lub profilu. Sprawdź konfigurację Supabase.",
    );
  }

  if (!billingContext || !business) {
    redirect("/onboarding");
  }

  if (!profile) {
    throw new Error("Nie znaleziono profilu użytkownika.");
  }

  const appPlan = billingContext.plan;
  const canVerifyAuthors = hasPlanCapability(appPlan, "authorVerification");
  const reviewsResult = canVerifyAuthors
    ? await supabase.from("reviews").select("id, author_name, rating, content, created_at, source").eq("business_id", business.id).eq("source", "google").order("created_at", { ascending: false })
    : { data: [], error: null };
  const plan = getPlanLabel(appPlan);
  const firstName = typeof profile.first_name === "string" ? profile.first_name.trim() : "";
  const displayName = firstName || user.email || "NU";
  const dashboardNotifications = await getDashboardNotifications(supabase, business.id);
  const authorReviews: AuthorVerificationReview[] = ((reviewsResult.data ?? []) as ReviewRow[]).map(review => ({
    id: review.id, authorName: review.author_name, rating: Number(review.rating),
    content: review.content, createdAt: review.created_at,
  }));
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F7F7FA] text-ink">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[252px] flex-col border-r border-black/[0.06] bg-white px-5 py-6 lg:flex">
        <BrandLogo />
        <DesktopBusinessSwitcher
          activeBusiness={business}
          billingContext={billingContext}
          plan={plan}
          userId={user.id}
        />
        <nav className="mt-7 space-y-1.5" aria-label="Nawigacja dashboardu">
          {navigation.map((item) => {
            const active = item.label === "Autorzy opinii";
            const className = `sidebar-nav-item flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition ${
              active
                ? "bg-brand-soft text-brand"
                : "text-black/45 hover:bg-black/[0.035] hover:text-ink"
            }`;

            return (
              <Link key={item.label} href={item.href} className={className}>
                <AppNavigationIcon name={item.icon} className="h-[18px] w-[18px]" />
                <span className="min-w-0 flex-1">{item.label}</span>
                <BusinessNavBadge
                  show={
                    item.label === "Autorzy opinii" &&
                    !canVerifyAuthors
                  }
                />
                {item.label === "Powiadomienia" ? (
                  <NotificationSidebarBadge unreadCount={dashboardNotifications.unreadCount} />
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
              <p className="mt-0.5 text-sm font-semibold">
                Autorzy opinii
              </p>
            </div>
            <div className="flex min-w-0 items-center gap-2.5">
              <NotificationBell initialNotifications={dashboardNotifications.latest} />
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
        </header>

        <MobileBottomNavigation unreadCount={dashboardNotifications.unreadCount} />

        <div className="min-w-0 px-4 py-5 min-[769px]:px-5 min-[769px]:py-8 sm:px-8 lg:px-9 lg:py-10">
          <div className="mx-auto min-w-0 max-w-[1450px]">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
                    Weryfikacja opinii
                  </p>
                </div>
                <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                  Autorzy opinii
                </h1>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-black/45 min-[769px]:mt-2">
                  Dla części opinii NuvoRate może udostępnić bezpośredni link do publicznego profilu autora w Google Maps.
                </p>
              </div>
            </div>

            {!canVerifyAuthors ? (
              <BusinessFeatureLock className="mt-8 min-h-[400px]" title="Autorzy opinii"
                description="Publiczne profile autorów w Google Maps dla części opinii."
                preview={<div className="p-8 text-black/40">Autor opinii · ★★★★★ · Google Maps</div>} />
            ) : (
              <AuthorVerificationList key={business.id} businessId={business.id} location={business.name} reviews={authorReviews} />
            )}

          </div>
        </div>
      </div>
    </main>
  );
}
