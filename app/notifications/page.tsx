import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/brand/logo";
import { DesktopBusinessSwitcher } from "@/components/business/desktop-business-switcher";
import { BusinessNavBadge } from "@/components/billing/business-nav-badge";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { NotificationHistoryActions } from "@/components/notifications/notification-history-actions";
import { MobileBottomNavigation } from "@/components/navigation/mobile-bottom-navigation";
import { AppNavigationIcon } from "@/components/navigation/app-navigation-icon";
import { NotificationLink } from "@/components/notifications/notification-link";
import { NotificationSidebarBadge } from "@/components/notifications/notification-sidebar-badge";
import { Pagination } from "@/components/ui/pagination";
import {
  formatNotificationMessage,
  formatRelativeNotificationTime,
  getNotificationView,
} from "@/lib/notification-ui";
import {
  getPlanLabel,
  hasPlanCapability,
} from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";
import { getActiveBusinessBillingContext } from "@/lib/active-business-billing";
import { signOut } from "@/app/dashboard/actions";

export const metadata: Metadata = {
  title: "Powiadomienia | NuvoRate",
};

type NotificationsPageProps = {
  searchParams: Promise<{ filter?: string; page?: string }>;
};

type NotificationIcon =
  | "analysis"
  | "bell"
  | "dashboard"
  | "logout"
  | "nfc"
  | "responses"
  | "reviews"
  | "settings"
  | "verification";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string | null;
  is_read: boolean;
  created_at: string;
};

function Icon({
  name,
  className = "h-5 w-5",
}: {
  name: NotificationIcon;
  className?: string;
}) {
  const paths: Record<NotificationIcon, React.ReactNode> = {
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
  { label: "Pomoc i kontakt", icon: "help" as const, href: "/support" },
];

const notificationsPerPage = 10;

function notificationTypeLabel(type: string) {
  const labels: Record<string, string> = {
    new_review: "Opinie",
  };

  return labels[type] ?? "System";
}

export default async function NotificationsPage({
  searchParams,
}: NotificationsPageProps) {
  const params = await searchParams;
  const filter = params.filter === "unread" ? "unread" : "all";
  const requestedPage = Number(params.page ?? "1");
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims) {
    redirect("/login?next=/notifications");
  }

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    redirect("/login?next=/notifications");
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
    throw new Error("Nie udało się odczytać powiadomień.");
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
  let notificationsQuery = supabase
    .from("notifications")
    .select("id, type, title, message, is_read, created_at")
    .eq("business_id", business.id)
    .eq("type", "new_review")
    .order("created_at", { ascending: false });

  if (filter === "unread") {
    notificationsQuery = notificationsQuery.eq("is_read", false);
  }

  const { data: notifications, error: notificationsError } =
    await notificationsQuery;

  if (notificationsError) {
    throw new Error("Nie udało się pobrać powiadomień.");
  }

  const notificationItems = (notifications ?? []) as Notification[];
  const unreadCount = notificationItems.filter((item) => !item.is_read).length;
  const totalPages = Math.max(
    1,
    Math.ceil(notificationItems.length / notificationsPerPage),
  );
  const currentPage = Number.isInteger(requestedPage)
    ? Math.min(Math.max(requestedPage, 1), totalPages)
    : 1;
  const pageStart = (currentPage - 1) * notificationsPerPage;
  const pageEnd = pageStart + notificationsPerPage;
  const paginatedNotifications = notificationItems.slice(pageStart, pageEnd);
  const buildNotificationsHref = (page: number) => {
    const query = new URLSearchParams();

    if (filter === "unread") {
      query.set("filter", "unread");
    }

    if (page > 1) {
      query.set("page", String(page));
    }

    const queryString = query.toString();
    return queryString ? `/notifications?${queryString}` : "/notifications";
  };

  return (
    <main className="min-h-screen bg-[#F7F7FA] text-ink">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[252px] flex-col border-r border-black/[0.06] bg-white px-4 py-5 lg:flex">
        <div className="px-2">
          <BrandLogo />
        </div>
        <DesktopBusinessSwitcher
          activeBusiness={business}
          plan={plan}
          userId={user.id}
        />
        <nav className="mt-7 space-y-1.5" aria-label="Nawigacja dashboardu">
          {navigation.map((item) => {
            const active = item.label === "Powiadomienia";
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
                    item.label === "Weryfikacja autora" &&
                    !hasPlanCapability(appPlan, "authorVerification")
                  }
                />
                {item.label === "Powiadomienia" ? (
                  <NotificationSidebarBadge businessId={business.id} />
                ) : null}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto">
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
              <p className="mt-0.5 text-sm font-semibold">Powiadomienia</p>
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

        <section className="px-4 py-5 min-[769px]:px-5 min-[769px]:py-7 sm:px-8 lg:px-9">
          <div className="mb-5 flex flex-col justify-between gap-3 min-[769px]:mb-6 min-[769px]:gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">
                Centrum zdarzeń
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-ink min-[769px]:mt-3 md:text-4xl">
                Powiadomienia
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-black/55 min-[769px]:mt-3">
                Najważniejsze zdarzenia z opinii, odpowiedzi i analiz reputacji w jednym miejscu.
              </p>
            </div>
            <NotificationHistoryActions
              totalCount={notificationItems.length}
              unreadCount={unreadCount}
            />
          </div>

          <div className="mb-4 flex flex-wrap gap-2 min-[769px]:mb-5">
            <Link
              href="/notifications"
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition min-[769px]:px-4 min-[769px]:py-2 min-[769px]:text-sm ${
                filter === "all"
                  ? "bg-brand text-white"
                  : "border border-black/[0.08] bg-white text-black/55 hover:text-brand"
              }`}
            >
              Wszystkie
            </Link>
            <Link
              href="/notifications?filter=unread"
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition min-[769px]:px-4 min-[769px]:py-2 min-[769px]:text-sm ${
                filter === "unread"
                  ? "bg-brand text-white"
                  : "border border-black/[0.08] bg-white text-black/55 hover:text-brand"
              }`}
            >
              Nieprzeczytane
            </Link>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-black/[0.06] bg-white shadow-[0_18px_50px_rgba(15,15,16,0.04)] max-[768px]:rounded-2xl">
            {notificationItems.length > 0 ? (
              paginatedNotifications.map((notification) => {
                const view = getNotificationView(
                  notification.type,
                  notification.message,
                );
                const content = formatNotificationMessage(
                  notification.type,
                  notification.message,
                );

                return (
                  <NotificationLink
                    key={notification.id}
                    className={`notification-list-item relative flex cursor-pointer gap-3 border-b border-black/[0.05] px-4 py-4 transition last:border-b-0 min-[769px]:hover:bg-black/[0.025] min-[769px]:gap-4 min-[769px]:px-5 min-[769px]:py-5 ${
                      notification.is_read ? "bg-white" : "bg-brand/[0.035]"
                    }`}
                    href={view.href}
                    isRead={notification.is_read}
                    notificationId={notification.id}
                  >
                    {!notification.is_read ? <span className="absolute inset-y-3 left-0 w-0.5 rounded-r-full bg-brand min-[769px]:inset-y-4 min-[769px]:w-1" /> : null}
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full min-[769px]:mt-2 min-[769px]:h-2.5 min-[769px]:w-2.5 ${notification.is_read ? "bg-black/10" : "bg-brand"}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between max-[768px]:flex-row max-[768px]:items-start max-[768px]:justify-between max-[768px]:gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-sm font-semibold text-ink min-[769px]:text-base">
                              {notification.title}
                            </h2>
                            <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-brand min-[769px]:px-2.5 min-[769px]:py-1 min-[769px]:text-[10px]">
                              {notificationTypeLabel(notification.type)}
                            </span>
                            {!notification.is_read ? <span className="rounded-full bg-ink px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white min-[769px]:px-2.5 min-[769px]:py-1 min-[769px]:text-[10px]">Nowe</span> : null}
                          </div>
                          {content.meta ? (
                            <p className="mt-1 text-xs font-medium text-black/60 min-[769px]:mt-2 min-[769px]:text-sm min-[769px]:font-semibold">
                              {content.meta}
                            </p>
                          ) : null}
                          {content.text ? (
                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-black/55 min-[769px]:text-sm min-[769px]:leading-6">
                              {content.text}
                            </p>
                          ) : null}
                        </div>
                        <p className="shrink-0 whitespace-nowrap text-[11px] text-black/40 min-[769px]:text-xs">
                          {formatRelativeNotificationTime(notification.created_at)}
                        </p>
                      </div>
                    </div>
                  </NotificationLink>
                );
              })
            ) : (
              <div className="px-6 py-10 text-center min-[769px]:py-16">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-soft text-brand">
                  <Icon name="bell" className="h-5 w-5" />
                </div>
                <h2 className="mt-5 text-lg font-semibold text-ink">
                  Brak nowych powiadomień
                </h2>
                <p className="mt-2 text-sm text-black/45">
                  Gdy pojawi się coś ważnego, zobaczysz to tutaj.
                </p>
              </div>
            )}
            {notificationItems.length > 0 ? (
              <>
                <div className="hidden px-5 py-5 min-[769px]:block">
                  <Pagination
                    buildHref={buildNotificationsHref}
                    currentPage={currentPage}
                    itemLabel="powiadomień"
                    pageSize={notificationsPerPage}
                    totalItems={notificationItems.length}
                  />
                </div>
                <div className="px-4 py-4 text-center min-[769px]:hidden">
                  {currentPage < totalPages ? <Link href={buildNotificationsHref(currentPage + 1)} className="inline-flex rounded-xl border border-black/[0.08] px-4 py-2.5 text-xs font-semibold text-brand">Załaduj więcej</Link> : null}
                  <p className="mt-2 text-[11px] text-black/40">Wyświetlono {Math.min(pageEnd, notificationItems.length)} z {notificationItems.length} powiadomień</p>
                </div>
              </>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
