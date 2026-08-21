import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/brand/logo";
import { DesktopBusinessSwitcher } from "@/components/business/desktop-business-switcher";
import { BusinessNavBadge } from "@/components/billing/business-nav-badge";
import { NfcTagManager } from "@/components/nfc/nfc-tag-manager";
import { NfcAddTagButton } from "@/components/nfc/nfc-add-tag-button";
import { NfcSetupInstructions } from "@/components/nfc/nfc-setup-instructions";
import { MobileBottomNavigation } from "@/components/navigation/mobile-bottom-navigation";
import { AppNavigationIcon } from "@/components/navigation/app-navigation-icon";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { NotificationSidebarBadge } from "@/components/notifications/notification-sidebar-badge";
import {
  getPlanLabel,
  hasPlanCapability,
} from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";
import { getActiveBusinessBillingContext } from "@/lib/active-business-billing";
import { signOut } from "@/app/dashboard/actions";

export const metadata: Metadata = {
  title: "NFC | NuvoRate",
};

type NfcIcon =
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
  name: NfcIcon;
  className?: string;
}) {
  const paths: Record<NfcIcon, React.ReactNode> = {
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
  {
    label: "Weryfikacja autora",
    icon: "verification" as const,
    href: "/author-verification",
  },
  { label: "NFC", icon: "nfc" as const, href: "/nfc" },
  { label: "Powiadomienia", icon: "bell" as const, href: "/notifications" },
  { label: "Ustawienia", icon: "settings" as const, href: "/settings" },
];

export default async function NfcPage() {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims) {
    redirect("/login?next=/nfc");
  }

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    redirect("/login?next=/nfc");
  }

  const [
    billingContext,
    { data: profile, error: profileError },
  ] = await Promise.all([
    getActiveBusinessBillingContext(supabase, user.id, "id, name, industry, city, google_review_url"),
    supabase
      .from("profiles")
      .select("first_name")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const business = billingContext?.activeBusiness.business;

  if (profileError) {
    throw new Error("Nie udało się odczytać danych modułu NFC.");
  }

  if (!billingContext || !business) {
    redirect("/onboarding");
  }

  if (!profile) {
    throw new Error("Nie znaleziono profilu użytkownika.");
  }

  const appPlan = billingContext.plan;
  const plan = getPlanLabel(appPlan);
  const firstName =
    typeof profile.first_name === "string" ? profile.first_name.trim() : "";
  const displayName = firstName || user.email || "NU";
  const businessName = business.name ?? "Twoja firma";
  if (!hasPlanCapability(appPlan, "nfcBasicStats")) {
    return (
      <main className="min-h-screen bg-[#F7F7FA] text-ink">
        <div className="flex min-h-screen items-center justify-center px-5 py-12">
          <section className="w-full max-w-3xl rounded-[32px] border border-black/[0.06] bg-white p-7 text-center shadow-card sm:p-10">
            <div className="mx-auto flex justify-center">
              <BrandLogo />
            </div>
            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.14em] text-brand">
              NFC
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Wybierz plan, aby korzystać z modułu NFC
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-black/50">
              Link do opinii i statystyki skanów są dostępne po aktywacji planu
              Starter albo Business.
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

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const [
    { data: nfcTags, error: nfcTagsError },
    { data: nfcScanRows, error: nfcScansError },
  ] = await Promise.all([
    supabase
      .from("nfc_tags")
      .select("id, name, public_token, destination_url, is_active")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("nfc_scans")
      .select("tag_id, scanned_at")
      .eq("business_id", business.id)
      .order("scanned_at", { ascending: false }),
  ]);

  if (nfcTagsError || nfcScansError) {
    throw new Error("Nie udało się odczytać danych NFC. Uruchom migracje 016_nfc_tags_and_scans.sql oraz 017_multiple_nfc_tags.sql w Supabase.");
  }

  const nfcBaseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const scans = nfcScanRows ?? [];
  const formatScan = (scannedAt?: string) => {
    if (!scannedAt) return "Brak skanów";
    const date = new Date(scannedAt);
    const now = new Date();
    const time = new Intl.DateTimeFormat("pl-PL", { hour: "2-digit", minute: "2-digit" }).format(date);
    const dayDifference = Math.floor((new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() - new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()) / 86_400_000);
    if (dayDifference === 0) return `Dzisiaj, ${time}`;
    if (dayDifference === 1) return `Wczoraj, ${time}`;
    return new Intl.DateTimeFormat("pl-PL", { dateStyle: "medium", timeStyle: "short" }).format(date);
  };
  const scansTotal = scans.length;
  const scansLast30Days = scans.filter((scan) => new Date(scan.scanned_at) >= thirtyDaysAgo).length;
  const lastScanLabel = formatScan(scans[0]?.scanned_at);
  const tags = (nfcTags ?? []).map((tag) => {
    const tagScans = scans.filter((scan) => scan.tag_id === tag.id);
    return {
      id: tag.id, name: tag.name, destinationUrl: tag.destination_url,
      publicUrl: `${nfcBaseUrl}/r/${tag.public_token}`, isActive: tag.is_active,
      scansTotal: tagScans.length,
      scansLast30Days: tagScans.filter((scan) => new Date(scan.scanned_at) >= thirtyDaysAgo).length,
      lastScanLabel: formatScan(tagScans[0]?.scanned_at),
    };
  });
  const activeTags = tags.filter((tag) => tag.isActive).length;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F7F7FA] text-ink">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[252px] flex-col border-r border-black/[0.06] bg-white px-5 py-6 lg:flex">
        <BrandLogo />
        <DesktopBusinessSwitcher
          activeBusiness={business}
          plan={plan}
          userId={user.id}
        />
        <nav className="mt-7 space-y-1.5" aria-label="Nawigacja dashboardu">
          {navigation.map((item) => {
            const active = item.label === "NFC";
            const className = `sidebar-nav-item flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition ${
              active
                ? "bg-brand-soft text-brand"
                : "text-black/45 hover:bg-black/[0.035] hover:text-ink"
            }`;

            if (item.href) {
              return (
                <Link key={item.label} href={item.href} className={className}>
                  <AppNavigationIcon name={item.icon} className="h-[18px] w-[18px]" />
                  <span className="min-w-0 flex-1">{item.label}</span>
                  <BusinessNavBadge
                    show={
                      item.label === "Weryfikacja autora" &&
                      !hasPlanCapability(appPlan, "authorVerification")
                    }
                  />
                  {item.label === "Powiadomienia" ? (
                    <NotificationSidebarBadge businessId={business.id} />
                  ) : null}
                </Link>
              );
            }

            return (
              <button key={item.label} type="button" className={className}>
                <AppNavigationIcon name={item.icon} className="h-[18px] w-[18px]" />
                <span className="min-w-0 flex-1">{item.label}</span>
                <BusinessNavBadge
                  show={
                    item.label === "Weryfikacja autora" &&
                    !hasPlanCapability(appPlan, "authorVerification")
                  }
                />
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
              <p className="truncate text-xs text-black/35">{businessName}</p>
              <p className="mt-0.5 text-sm font-semibold">NFC</p>
            </div>
            <div className="flex min-w-0 items-center gap-2.5">
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
        </header>

        <MobileBottomNavigation businessId={business.id} />

        <div className="min-w-0 px-4 py-5 min-[769px]:px-5 min-[769px]:py-8 sm:px-8 lg:px-9 lg:py-10">
          <div className="mx-auto min-w-0 max-w-[1450px]">
            <div className="max-[768px]:flex max-[768px]:flex-wrap max-[768px]:items-end max-[768px]:justify-between max-[768px]:gap-3">
              <div>
              <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                NFC
              </h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-black/45 min-[769px]:mt-2">
                <span className="min-[769px]:hidden">Zarządzaj plakietkami i śledź ich skuteczność.</span>
                <span className="max-[768px]:hidden">Zarządzaj linkiem do opinii i śledź skany z plakietek NFC.</span>
              </p>
              </div>
              <NfcAddTagButton className="button-primary shrink-0 px-3 py-2 text-xs min-[769px]:hidden" />
            </div>

            <section className="mt-5 grid grid-cols-2 gap-3 min-[769px]:hidden" aria-label="Statystyki NFC">
              {[
                ["Skany · 30 dni", scansLast30Days],
                ["Skany łącznie", scansTotal],
                ["Aktywne plakietki", activeTags],
                ["Ostatni skan", lastScanLabel],
              ].map(([label, value]) => (
                <article key={label as string} className="min-h-[102px] rounded-2xl border border-black/[0.06] bg-white p-4 shadow-card">
                  <p className="text-[11px] font-medium leading-4 text-black/45">{label as string}</p>
                  <p className={`mt-2 font-semibold tracking-[-0.04em] ${label === "Ostatni skan" ? "text-base leading-6" : "text-2xl"}`}>{value as string | number}</p>
                </article>
              ))}
            </section>

            <section className="mt-8 hidden gap-4 min-[769px]:grid sm:grid-cols-2 xl:grid-cols-4" aria-label="Statystyki NFC">
              {[
                ["Skany w ostatnich 30 dniach", scansLast30Days, "ze wszystkich aktywnych plakietek"],
                ["Skany łącznie", scansTotal, "od uruchomienia NFC"],
                ["Aktywne plakietki", activeTags, "gotowe do zbierania opinii"],
                ["Ostatni skan", lastScanLabel, "ostatnia aktywność klienta"],
              ].map(([label, value, detail]) => (
                <article key={label as string} className="min-h-[172px] rounded-[24px] border border-black/[0.06] bg-white p-5 shadow-card sm:p-6">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-soft text-brand">
                    <Icon name="nfc" className="h-5 w-5" />
                  </span>
                  <p className="mt-5 text-xs font-medium text-black/40">{label as string}</p>
                  <p className={`mt-2 font-semibold tracking-[-0.04em] ${label === "Ostatni skan" ? "text-xl leading-7" : "text-3xl"}`}>{value as string | number}</p>
                  <p className="mt-2 text-xs leading-5 text-black/40">{detail as string}</p>
                </article>
              ))}
            </section>
            <NfcTagManager tags={tags} />
            <NfcSetupInstructions />
          </div>
        </div>
      </div>
    </main>
  );
}
