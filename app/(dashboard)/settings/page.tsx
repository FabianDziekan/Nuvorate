import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { BrandLogo } from "@/components/brand/logo";
import { DesktopBusinessSwitcher } from "@/components/business/desktop-business-switcher";
import { AiUsageCard } from "@/components/billing/ai-usage-card";
import { BusinessNavBadge } from "@/components/billing/business-nav-badge";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { NotificationSidebarBadge } from "@/components/notifications/notification-sidebar-badge";
import { SettingsForm } from "@/components/settings/settings-form";
import { GoogleConnectionCard } from "@/components/settings/google-connection-card";
import { MobileBottomNavigation } from "@/components/navigation/mobile-bottom-navigation";
import { AppNavigationIcon } from "@/components/navigation/app-navigation-icon";
import { googleConfigured } from "@/lib/google-business";
import {
  currentPeriodMonth,
  getAiLimit,
  getPlanLabel,
  hasPlanCapability,
} from "@/lib/plans";
import { getDashboardRequestClient as createClient, getDashboardUser, getDashboardRequestContext } from "@/lib/dashboard-request-context";
import { getDashboardNotifications } from "@/lib/dashboard-notifications";
import { signOut } from "@/app/dashboard/actions";

export const metadata: Metadata = {
  title: "Ustawienia | NuvoRate",
};

type SettingsIcon =
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
  name: SettingsIcon;
  className?: string;
}) {
  const paths: Record<SettingsIcon, React.ReactNode> = {
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

function subscriptionStatusLabel(value: string | null | undefined) {
  if (!value) {
    return "Brak aktywnej subskrypcji";
  }

  const labels: Record<string, string> = {
    active: "Aktywna",
    canceled: "Anulowana",
    incomplete: "Nieukończona",
    incomplete_expired: "Wygasła przed aktywacją",
    past_due: "Wymaga uwagi",
    trialing: "Okres próbny",
    unpaid: "Nieopłacona",
  };

  return labels[value] ?? value;
}

type AiUsage = {
  ai_replies_used: number | null;
  ai_analyses_used: number | null;
};

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ google?: string; google_error?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims) {
    redirect("/login?next=/settings");
  }

  const { data: userData } = await getDashboardUser();
  const user = userData.user;

  if (!user) {
    redirect("/login?next=/settings");
  }

  const dashboardContext = await getDashboardRequestContext(user.id);
  const { billingContext, profileResult: { data: profile, error: profileError } } = dashboardContext;

  const business = billingContext?.activeBusiness.business;

  if (profileError) {
    throw new Error("Nie udało się odczytać ustawień konta.");
  }

  if (!billingContext || !business) {
    redirect("/onboarding");
  }

  if (!profile) {
    throw new Error("Nie znaleziono profilu użytkownika.");
  }

  const [
    { data: responseSettings, error: responseSettingsError },
    { data: aiUsage, error: aiUsageError },
    { data: googleConnection },
  ] = await Promise.all([
    supabase
      .from("business_response_settings")
      .select("response_tone")
      .eq("business_id", business.id)
      .maybeSingle(),
    supabase
      .from("ai_usage")
      .select("ai_replies_used, ai_analyses_used")
      .eq("user_id", billingContext.billingOwnerId)
      .eq("period_month", currentPeriodMonth())
      .maybeSingle(),
    supabase.from("google_business_connections").select("google_location_title, google_email").eq("business_id", business.id).maybeSingle(),
  ]);

  if (responseSettingsError) {
    console.warn(
      "Optional response tone setting is unavailable. Run 009_settings_fields.sql.",
      responseSettingsError,
    );
  }

  const appPlan = billingContext.plan;
  const plan = getPlanLabel(appPlan);
  const canManageActiveBusinessBilling = billingContext.billingOwnerId === user.id;
  const firstName =
    typeof profile.first_name === "string" ? profile.first_name.trim() : "";
  const displayName = firstName || user.email || "NU";
  const responseTone =
    typeof responseSettings?.response_tone === "string"
      ? responseSettings.response_tone
      : "professional";

  if (aiUsageError) {
    console.warn("AI usage lookup failed", aiUsageError);
  }

  const currentAiUsage = aiUsageError ? null : (aiUsage as AiUsage | null);
  const aiRepliesUsed = Number(currentAiUsage?.ai_replies_used ?? 0) || 0;
  const aiAnalysesUsed = Number(currentAiUsage?.ai_analyses_used ?? 0) || 0;
  const aiRepliesLimit = getAiLimit(appPlan, "reply");
  const aiAnalysesLimit = getAiLimit(appPlan, "analysis");
  const pendingRaw = (await cookies()).get("google_pending_connection")?.value;
  let pendingLocations: Array<{ locationName: string; locationTitle: string }> = [];
  try { const pending = pendingRaw ? JSON.parse(Buffer.from(pendingRaw, "base64url").toString("utf8")) : null; if (pending?.businessId === business.id && Array.isArray(pending.locations)) pendingLocations = pending.locations.map((location: { locationName: string; locationTitle: string }) => ({ locationName: location.locationName, locationTitle: location.locationTitle })); } catch {}
  const googleMessage = params.google === "connected" ? "Profil Google został połączony." : params.google_error === "no_locations" ? "Nie znaleźliśmy lokalizacji Google Business Profile na tym koncie." : params.google_error ? "Nie udało się dokończyć połączenia z Google. Spróbuj ponownie." : undefined;

  return (
<>

        <div className="min-w-0 px-4 py-5 min-[769px]:px-5 min-[769px]:py-8 sm:px-8 lg:px-9 lg:py-10">
          <div className="mx-auto min-w-0 max-w-[1180px]">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
                  Konfiguracja
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                  Ustawienia
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-black/45">
                  <span className="min-[769px]:hidden">Zarządzaj kontem, firmą i konfiguracją NuvoRate.</span>
                  <span className="max-[768px]:hidden">Zarządzaj profilem firmy, stylem odpowiedzi i kontem NuvoRate.</span>
                </p>
              </div>
            </div>

            <div className="mt-8">
              <SettingsForm
                business={{
                  industry: business.industry ?? "",
                  name: business.name ?? "",
                }}
                firstName={firstName}
                responseTone={responseTone}
              />
              <div className="max-[768px]:mt-4">
                <p className="mb-3 hidden text-[11px] font-semibold uppercase tracking-[0.14em] text-black/35 max-[768px]:block">Integracje</p>
                <GoogleConnectionCard configured={googleConfigured()} connection={googleConnection} message={googleMessage} locations={pendingLocations} />
              </div>
            </div>

            <section className="mt-6 hidden rounded-[24px] border border-black/[0.06] bg-white p-5 shadow-card min-[769px]:block sm:p-6">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-black/35">
                    Konto i plan
                  </p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight">
                    Plan {plan}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-black/45">
                    Status subskrypcji:{" "}
                    <span className="font-semibold text-ink">
                      {subscriptionStatusLabel(billingContext.subscriptionStatus)}
                    </span>
                  </p>
                  <p className="mt-1 text-sm leading-6 text-black/45">
                    Email użytkownika:{" "}
                    <span className="font-semibold text-ink">{user.email}</span>
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  {canManageActiveBusinessBilling ? (
                    <form method="post" action="/billing/portal"><button type="submit"
                      className="rounded-xl bg-ink px-4 py-3 text-center text-xs font-semibold text-white transition hover:bg-black"
                    >
                      Zarządzaj subskrypcją
                    </button></form>
                  ) : null}
                  <button
                    type="button"
                    disabled
                    className="rounded-xl border border-black/[0.08] bg-[#FAFAFC] px-4 py-3 text-xs font-semibold text-black/30"
                  >
                    Zmień hasło wkrótce
                  </button>
                  <form action={signOut}>
                    <button
                      type="submit"
                      className="w-full rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-semibold text-red-600 transition hover:bg-red-100 sm:w-auto"
                    >
                      Wyloguj się
                    </button>
                  </form>
                </div>
              </div>
            </section>

            <section className="mt-4 overflow-hidden rounded-[24px] border border-black/[0.06] bg-white shadow-card min-[769px]:hidden">
              <div className="px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/35">Konto i plan</p>
                <div className="mt-2 flex items-center justify-between gap-3"><div><p className="text-sm font-semibold">Plan {plan}</p><p className="mt-0.5 text-xs text-black/45">{subscriptionStatusLabel(billingContext.subscriptionStatus)}</p></div>{canManageActiveBusinessBilling ? <form method="post" action="/billing/portal"><button type="submit" className="text-xs font-semibold text-brand">Zarządzaj ›</button></form> : null}</div>
              </div>
              <details className="border-t border-black/[0.06]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 text-sm font-semibold text-ink"><span>Limity planu</span><span className="text-brand" aria-hidden="true">⌄</span></summary>
                <div className="border-t border-black/[0.06] p-4"><AiUsageCard plan={appPlan} repliesUsed={aiRepliesUsed} repliesLimit={aiRepliesLimit} analysesUsed={aiAnalysesUsed} analysesLimit={aiAnalysesLimit} /></div>
              </details>
            </section>

            <form action={signOut} className="mt-4 min-[769px]:hidden">
              <button type="submit" className="w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50">Wyloguj się</button>
            </form>
          </div>
        </div>
    </>
  );
}
