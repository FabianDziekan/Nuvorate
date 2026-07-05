import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/brand/logo";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { NotificationLink } from "@/components/notifications/notification-link";
import { NotificationSidebarBadge } from "@/components/notifications/notification-sidebar-badge";
import {
  formatNotificationMessage,
  formatRelativeNotificationTime,
  getNotificationView,
} from "@/lib/notification-ui";
import { getPlanLabel, normalizePlan } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/dashboard/actions";
import { markAllNotificationsAsRead } from "./actions";

export const metadata: Metadata = {
  title: "Powiadomienia | NuvoRate",
};

type NotificationsPageProps = {
  searchParams: Promise<{ filter?: string }>;
};

type NotificationIcon =
  | "analysis"
  | "bell"
  | "dashboard"
  | "logout"
  | "nfc"
  | "responses"
  | "reviews"
  | "settings";

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

function notificationTypeLabel(type: string) {
  const labels: Record<string, string> = {
    analysis_ready: "Analiza",
    limit_warning: "Limity",
    new_review: "Opinie",
    response_generated: "Odpowiedzi",
    subscription: "Subskrypcja",
  };

  return labels[type] ?? "System";
}

export default async function NotificationsPage({
  searchParams,
}: NotificationsPageProps) {
  const params = await searchParams;
  const filter = params.filter === "unread" ? "unread" : "all";
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
    throw new Error("Nie udało się odczytać powiadomień.");
  }

  if (!business) {
    redirect("/onboarding");
  }

  if (!profile) {
    throw new Error("Nie znaleziono profilu użytkownika.");
  }

  const plan = getPlanLabel(normalizePlan(profile.plan));
  const displayName = user.email?.split("@")[0] ?? "NU";
  let notificationsQuery = supabase
    .from("notifications")
    .select("id, type, title, message, is_read, created_at")
    .eq("business_id", business.id)
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

  return (
    <main className="min-h-screen bg-[#F7F7FA] text-ink">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[252px] flex-col border-r border-black/[0.06] bg-white px-4 py-5 lg:flex">
        <Link href="/dashboard" className="px-2">
          <BrandLogo />
        </Link>
        <div className="mt-8 rounded-[22px] border border-black/[0.06] bg-[#F7F7FA] p-4">
          <p className="text-[11px] uppercase tracking-[0.22em] text-black/35">
            Firma
          </p>
          <p className="mt-2 truncate text-sm font-semibold">{business.name}</p>
          <p className="mt-2 truncate text-xs text-black/40">{business.industry}</p>
          <p className="mt-1 truncate text-xs text-black/40">{business.city}</p>
          <p className="mt-2 text-[11px] font-semibold text-brand">Plan {plan}</p>
        </div>
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
        <header className="sticky top-0 z-20 border-b border-black/[0.06] bg-white/90 backdrop-blur-xl">
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
          <nav
            className="flex gap-1 overflow-x-auto border-t border-black/[0.05] px-4 py-2 lg:hidden"
            aria-label="Mobilna nawigacja dashboardu"
          >
            {navigation.map((item) => {
              const active = item.label === "Powiadomienia";
              const className = `flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium ${
                active ? "bg-brand-soft text-brand" : "text-black/40"
              }`;

              return (
                <Link key={item.label} href={item.href} className={className}>
                  <Icon name={item.icon} className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>

        <section className="px-5 py-7 sm:px-8 lg:px-9">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">
                Centrum zdarzeń
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-ink md:text-4xl">
                Powiadomienia
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-black/55">
                Najważniejsze zdarzenia z opinii, odpowiedzi i analiz reputacji
                w jednym miejscu.
              </p>
            </div>
            <form action={markAllNotificationsAsRead}>
              <button
                type="submit"
                disabled={unreadCount === 0}
                className="rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-black disabled:cursor-not-allowed disabled:bg-black/20"
              >
                Oznacz wszystkie jako przeczytane
              </button>
            </form>
          </div>

          <div className="mb-5 flex flex-wrap gap-2">
            <Link
              href="/notifications"
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filter === "all"
                  ? "bg-brand text-white"
                  : "border border-black/[0.08] bg-white text-black/55 hover:text-brand"
              }`}
            >
              Wszystkie
            </Link>
            <Link
              href="/notifications?filter=unread"
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filter === "unread"
                  ? "bg-brand text-white"
                  : "border border-black/[0.08] bg-white text-black/55 hover:text-brand"
              }`}
            >
              Nieprzeczytane
            </Link>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-black/[0.06] bg-white shadow-[0_18px_50px_rgba(15,15,16,0.04)]">
            {notificationItems.length > 0 ? (
              notificationItems.map((notification) => {
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
                    className={`relative flex cursor-pointer gap-4 border-b border-black/[0.05] px-5 py-5 transition last:border-b-0 hover:bg-black/[0.025] ${
                      notification.is_read ? "bg-white" : "bg-brand/[0.035]"
                    }`}
                    href={view.href}
                    isRead={notification.is_read}
                    notificationId={notification.id}
                  >
                    {!notification.is_read ? (
                      <span className="absolute inset-y-4 left-0 w-1 rounded-r-full bg-brand" />
                    ) : null}
                    <span
                      className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${
                        notification.is_read ? "bg-black/10" : "bg-brand"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-base font-semibold text-ink">
                              {notification.title}
                            </h2>
                            <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand">
                              {notificationTypeLabel(notification.type)}
                            </span>
                            {!notification.is_read ? (
                              <span className="rounded-full bg-ink px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                                Nowe
                              </span>
                            ) : null}
                          </div>
                          {content.meta ? (
                            <p className="mt-2 text-sm font-semibold text-black/65">
                              {content.meta}
                            </p>
                          ) : null}
                          {content.text ? (
                            <p className="mt-1 text-sm leading-6 text-black/55">
                              {content.text}
                            </p>
                          ) : null}
                        </div>
                        <p className="shrink-0 text-xs text-black/40">
                          {formatRelativeNotificationTime(notification.created_at)}
                        </p>
                      </div>
                    </div>
                  </NotificationLink>
                );
              })
            ) : (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-soft text-brand">
                  <Icon name="bell" className="h-5 w-5" />
                </div>
                <h2 className="mt-5 text-lg font-semibold text-ink">
                  Brak nowych powiadomień
                </h2>
                <p className="mt-2 text-sm text-black/45">
                  Gdy pojawią się ważne zdarzenia, zobaczysz je tutaj.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
