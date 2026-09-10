import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand/logo";
import { DesktopBusinessSwitcher } from "@/components/business/desktop-business-switcher";
import { MobileBusinessSwitcher } from "@/components/business/mobile-business-switcher";
import { MobileBottomNavigation } from "@/components/navigation/mobile-bottom-navigation";
import { AppNavigationIcon } from "@/components/navigation/app-navigation-icon";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { NotificationSidebarBadge } from "@/components/notifications/notification-sidebar-badge";
import { getDashboardRequestContext, getDashboardUser } from "@/lib/dashboard-request-context";
import { getPlanLabel } from "@/lib/plans";
import { signOut } from "@/app/dashboard/actions";
import { DashboardShellClient, DashboardShellDashboardOnly, DashboardShellHeaderActionSlot, DashboardShellNavItem, DashboardShellPlanCard, DashboardShellScrollArea, DashboardShellTitle } from "./dashboard-shell-client";

const navigation = [
  { label: "Pulpit", href: "/dashboard", icon: "dashboard" as const },
  { label: "Opinie", href: "/reviews", icon: "reviews" as const },
  { label: "Analiza", href: "/analysis", icon: "analysis" as const },
  { label: "Odpowiedzi", href: "/responses", icon: "responses" as const },
  { label: "NFC", href: "/nfc", icon: "nfc" as const },
  { label: "Powiadomienia", href: "/notifications", icon: "bell" as const },
  { label: "Ustawienia", href: "/settings", icon: "settings" as const },
  { label: "Pomoc i kontakt", href: "/support", icon: "help" as const },
];

export async function DashboardShell({ children }: { children: ReactNode }) {
  const { data: userData } = await getDashboardUser();
  const user = userData.user;
  // Individual pages retain route-specific login and onboarding redirects.
  if (!user) return <>{children}</>;
  const dashboardContext = await getDashboardRequestContext(user.id);
  const billingContext = dashboardContext.billingContext;
  if (!billingContext) return <>{children}</>;
  const business = billingContext.activeBusiness.business;
  const plan = getPlanLabel(billingContext.plan);
  const hasActiveSubscription = ["active", "trialing"].includes(billingContext.subscriptionStatus ?? "");
  const firstName = typeof dashboardContext.profileResult.data?.first_name === "string"
    ? dashboardContext.profileResult.data.first_name.trim() : "";
  const notifications = dashboardContext.notifications;

  return (
    <DashboardShellClient>
      <main className="h-dvh overflow-hidden bg-[#F7F7FA] text-ink">
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-[252px] flex-col border-r border-black/[0.06] bg-white px-5 py-6 lg:flex">
          <BrandLogo />
          <DesktopBusinessSwitcher activeBusiness={business} billingContext={billingContext} dashboardContext={dashboardContext} plan={plan} userId={user.id} />
          <nav className="mt-7 space-y-1.5" aria-label="Nawigacja dashboardu">
            {navigation.map((item) => (
              <DashboardShellNavItem key={item.href} href={item.href}>
                <AppNavigationIcon name={item.icon} className="h-[18px] w-[18px]" />
                <span className="min-w-0 flex-1">{item.label}</span>
                {item.label === "Powiadomienia" ? <NotificationSidebarBadge unreadCount={notifications.unreadCount} /> : null}
              </DashboardShellNavItem>
            ))}
          </nav>
          <div className="mt-auto">
            <DashboardShellPlanCard plan={plan} hasActiveSubscription={hasActiveSubscription} />
            <form action={signOut} className="mt-3"><button type="submit" className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-black/45 transition hover:bg-red-50 hover:text-red-600"><AppNavigationIcon name="logout" className="h-[18px] w-[18px]" />Wyloguj się</button></form>
          </div>
        </aside>
        <div className="flex h-dvh min-w-0 flex-col lg:pl-[252px]">
          <header className="dashboard-topbar z-20 shrink-0 border-b border-black/[0.06] bg-white/90 backdrop-blur-xl">
            <div className="flex h-[74px] min-w-0 items-center justify-between gap-4 px-5 sm:px-8 lg:px-9">
              <div className="shrink-0 lg:hidden"><BrandLogo /></div>
              <DashboardShellTitle businessName={business.name ?? "Twoja firma"} />
              <div className="flex min-w-0 items-center gap-2.5">
                <DashboardShellHeaderActionSlot />
                <DashboardShellDashboardOnly><MobileBusinessSwitcher billingContext={billingContext} dashboardContext={dashboardContext} userId={user.id} /></DashboardShellDashboardOnly>
                <NotificationBell key={business.id} initialNotifications={notifications.latest} />
                <div className="hidden items-center gap-3 rounded-xl border border-black/[0.08] bg-white py-1.5 pl-1.5 pr-3 sm:flex"><span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-soft text-xs font-bold uppercase text-brand">{(firstName || user.email || "NU").slice(0, 2)}</span><div className="max-w-[150px]"><p className="truncate text-xs font-semibold">{user.email}</p><p className="text-[10px] text-black/35">Plan {plan}</p></div></div>
                <form action={signOut} className="lg:hidden"><button type="submit" className="grid h-11 w-11 place-items-center rounded-xl border border-black/[0.08] bg-white text-black/50" aria-label="Wyloguj się"><AppNavigationIcon name="logout" className="h-[18px] w-[18px]" /></button></form>
              </div>
            </div>
          </header>
          <MobileBottomNavigation key={business.id} unreadCount={notifications.unreadCount} />
          <DashboardShellScrollArea>{children}</DashboardShellScrollArea>
        </div>
      </main>
    </DashboardShellClient>
  );
}
