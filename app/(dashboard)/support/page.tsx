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
import { getDashboardRequestClient as createClient, getDashboardUser, getDashboardRequestContext } from "@/lib/dashboard-request-context";
import { getDashboardNotifications } from "@/lib/dashboard-notifications";
import { getPlanLabel, hasPlanCapability } from "@/lib/plans";
import { signOut } from "@/app/dashboard/actions";

export const metadata: Metadata = {
  title: "Pomoc i kontakt | NuvoRate",
};

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

export default async function SupportPage() {
  const supabase = await createClient();
  const { data: userData } = await getDashboardUser();
  const user = userData.user;
  if (!user) redirect("/login?next=/support");

  const dashboardContext = await getDashboardRequestContext(user.id);
  const { billingContext, profileResult: { data: profile } } = dashboardContext;
  const business = billingContext?.activeBusiness.business;
  if (!billingContext || !business) redirect("/onboarding");

  const plan = getPlanLabel(billingContext.plan);
  const displayName = (typeof profile?.first_name === "string" && profile.first_name.trim()) || user.email || "NU";

  return (
<>
        <div className="min-w-0 px-4 py-5 min-[769px]:px-5 min-[769px]:py-8 sm:px-8 lg:px-9 lg:py-10">
          <div className="mx-auto min-w-0 max-w-[860px]">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">Wsparcie</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Pomoc i kontakt</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-black/45">Masz pytanie lub problem? Wyślij zgłoszenie, a odpowiemy na adres e-mail przypisany do Twojego konta.</p>
            <div className="mt-7"><SupportForm /></div>
          </div>
        </div>
    </>
  );
}
