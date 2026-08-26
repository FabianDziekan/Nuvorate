import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/brand/logo";
import { DesktopBusinessSwitcher } from "@/components/business/desktop-business-switcher";
import { MobileBottomNavigation } from "@/components/navigation/mobile-bottom-navigation";
import { AppNavigationIcon } from "@/components/navigation/app-navigation-icon";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { NotificationSidebarBadge } from "@/components/notifications/notification-sidebar-badge";
import { SupportForm } from "@/components/support/support-form";
import { getActiveBusinessBillingContext } from "@/lib/active-business-billing";
import { getPlanLabel, hasPlanCapability } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/dashboard/actions";

export const metadata: Metadata = {
  title: "Pomoc i kontakt | NuvoRate",
};

const navigation = [
  { label: "Pulpit", icon: "dashboard" as const, href: "/dashboard" },
  { label: "Opinie", icon: "reviews" as const, href: "/reviews" },
  { label: "Analiza", icon: "analysis" as const, href: "/analysis" },
  { label: "Odpowiedzi", icon: "responses" as const, href: "/responses" },
  { label: "Weryfikacja autora", icon: "verification" as const, href: "/author-verification" },
  { label: "NFC", icon: "nfc" as const, href: "/nfc" },
  { label: "Powiadomienia", icon: "bell" as const, href: "/notifications" },
  { label: "Ustawienia", icon: "settings" as const, href: "/settings" },
  { label: "Pomoc i kontakt", icon: "help" as const, href: "/support" },
];

export default async function SupportPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login?next=/support");

  const [billingContext, { data: profile }] = await Promise.all([
    getActiveBusinessBillingContext(supabase, user.id, "id, name, city"),
    supabase.from("profiles").select("first_name").eq("user_id", user.id).maybeSingle(),
  ]);
  const business = billingContext?.activeBusiness.business;
  if (!billingContext || !business) redirect("/onboarding");

  const plan = getPlanLabel(billingContext.plan);
  const displayName = (typeof profile?.first_name === "string" && profile.first_name.trim()) || user.email || "NU";

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F7F7FA] text-ink">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[252px] flex-col border-r border-black/[0.06] bg-white px-5 py-6 lg:flex">
        <BrandLogo />
        <DesktopBusinessSwitcher activeBusiness={business} plan={plan} userId={user.id} />
        <nav className="mt-7 space-y-1.5" aria-label="Nawigacja dashboardu">
          {navigation.map((item) => {
            const active = item.href === "/support";
            return (
              <Link key={item.href} href={item.href} className={`sidebar-nav-item flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition ${active ? "bg-brand-soft text-brand" : "text-black/45 hover:bg-black/[0.035] hover:text-ink"}`}>
                <AppNavigationIcon name={item.icon} className="h-[18px] w-[18px]" />
                <span className="min-w-0 flex-1">{item.label}</span>
                {item.href === "/notifications" ? <NotificationSidebarBadge businessId={business.id} /> : null}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto">
          <div className="rounded-2xl bg-ink p-4 text-white">
            <p className="text-[11px] text-white/45">Aktywny plan</p>
            <div className="mt-1 flex items-center justify-between"><p className="font-semibold">{plan}</p><span className="rounded-full bg-brand px-2 py-1 text-[9px] font-semibold uppercase tracking-wider">aktywny</span></div>
            <Link href="/billing/portal" className="mt-4 block w-full rounded-xl bg-white/10 px-3 py-2.5 text-center text-xs font-semibold text-white transition hover:bg-white/15">Zarządzaj subskrypcją</Link>
          </div>
          <form action={signOut} className="mt-3"><button type="submit" className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-black/45 transition hover:bg-red-50 hover:text-red-600"><AppNavigationIcon name="logout" className="h-[18px] w-[18px]" />Wyloguj się</button></form>
        </div>
      </aside>

      <div className="min-w-0 lg:pl-[252px]">
        <header className="dashboard-topbar sticky top-0 z-20 border-b border-black/[0.06] bg-white/90 backdrop-blur-xl">
          <div className="flex h-[74px] min-w-0 items-center justify-between gap-4 px-5 sm:px-8 lg:px-9">
            <div className="shrink-0 lg:hidden"><BrandLogo /></div>
            <div className="hidden min-w-0 lg:block"><p className="truncate text-xs text-black/35">{business.name}</p><p className="mt-0.5 text-sm font-semibold">Pomoc i kontakt</p></div>
            <div className="flex min-w-0 items-center gap-2.5">
              <NotificationBell businessId={business.id} />
              <div className="hidden items-center gap-3 rounded-xl border border-black/[0.08] bg-white py-1.5 pl-1.5 pr-3 sm:flex"><span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-soft text-xs font-bold uppercase text-brand">{displayName.slice(0, 2)}</span><div className="max-w-[150px]"><p className="truncate text-xs font-semibold">{user.email}</p><p className="text-[10px] text-black/35">Plan {plan}</p></div></div>
              <form action={signOut} className="lg:hidden"><button type="submit" className="grid h-11 w-11 place-items-center rounded-xl border border-black/[0.08] bg-white text-black/50" aria-label="Wyloguj się"><AppNavigationIcon name="logout" className="h-[18px] w-[18px]" /></button></form>
            </div>
          </div>
        </header>
        <MobileBottomNavigation businessId={business.id} />
        <div className="min-w-0 px-4 py-5 min-[769px]:px-5 min-[769px]:py-8 sm:px-8 lg:px-9 lg:py-10">
          <div className="mx-auto min-w-0 max-w-[860px]">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">Wsparcie</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Pomoc i kontakt</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-black/45">Masz pytanie lub problem? Wyślij zgłoszenie, a odpowiemy na adres e-mail przypisany do Twojego konta.</p>
            <div className="mt-7"><SupportForm /></div>
          </div>
        </div>
      </div>
    </main>
  );
}
