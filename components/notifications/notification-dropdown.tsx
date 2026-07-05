"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { NotificationLink } from "@/components/notifications/notification-link";
import {
  formatNotificationMessage,
  formatRelativeNotificationTime,
  getNotificationView,
} from "@/lib/notification-ui";

type AppNotification = {
  id: string;
  business_id: string;
  type: string;
  title: string;
  message: string | null;
  is_read: boolean;
  created_at: string;
};

function BellIcon({ className = "h-[18px] w-[18px]" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  );
}

export function NotificationDropdown({
  initialNotifications,
}: {
  initialNotifications: AppNotification[];
}) {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isPending, startTransition] = useTransition();
  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.is_read).length,
    [notifications],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function markAsRead(notificationId: string) {
    const notification = notifications.find((item) => item.id === notificationId);

    if (!notification || notification.is_read) {
      return;
    }

    setNotifications((items) =>
      items.map((item) =>
        item.id === notificationId ? { ...item, is_read: true } : item,
      ),
    );

  }

  function markAllAsRead() {
    setNotifications((items) =>
      items.map((item) => ({ ...item, is_read: true })),
    );

    startTransition(async () => {
      await fetch("/api/notifications/read-all", {
        method: "PATCH",
      });
      router.refresh();
    });
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        className="relative grid h-11 w-11 place-items-center rounded-xl border border-black/[0.08] bg-white text-black/50 transition hover:border-brand/30 hover:text-brand"
        aria-expanded={isOpen}
        aria-label="Powiadomienia"
        onClick={() => setIsOpen((value) => !value)}
      >
        <BellIcon />
        {unreadCount > 0 ? (
          <span className="notification-topbar-badge absolute -right-1 -top-1 grid min-h-[18px] min-w-[18px] place-items-center rounded-full bg-brand px-1.5 text-[10px] font-bold text-white shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-[min(360px,calc(100vw-32px))] overflow-hidden rounded-[22px] border border-black/[0.08] bg-white shadow-[0_24px_70px_rgba(15,15,16,0.16)]">
          <div className="flex items-center justify-between gap-3 border-b border-black/[0.06] px-4 py-3.5">
            <div>
              <p className="text-sm font-semibold text-ink">Powiadomienia</p>
              <p className="mt-0.5 text-xs text-black/40">
                {unreadCount > 0
                  ? `${unreadCount} nieprzeczytane`
                  : "Wszystko przeczytane"}
              </p>
            </div>
            <button
              type="button"
              disabled={isPending || unreadCount === 0}
              className="rounded-full px-3 py-1.5 text-xs font-semibold text-brand transition hover:bg-brand-soft disabled:cursor-not-allowed disabled:text-black/25"
              onClick={markAllAsRead}
            >
              Oznacz wszystkie
            </button>
          </div>

          <div className="max-h-[390px] overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => {
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
                    className={`group relative flex w-full cursor-pointer gap-3 border-b border-black/[0.04] px-4 py-3.5 text-left transition hover:bg-black/[0.025] ${
                      notification.is_read ? "bg-white" : "bg-brand/[0.035]"
                    }`}
                    href={view.href}
                    isRead={notification.is_read}
                    notificationId={notification.id}
                    onRead={(notificationId) => {
                      markAsRead(notificationId);
                      setIsOpen(false);
                    }}
                  >
                    {!notification.is_read ? (
                      <span className="absolute inset-y-3 left-0 w-1 rounded-r-full bg-brand" />
                    ) : null}
                    <span
                      className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                        notification.is_read ? "bg-black/10" : "bg-brand"
                      }`}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-3">
                        <span className="text-sm font-semibold text-ink">
                          {notification.title}
                        </span>
                        <span className="shrink-0 text-[11px] text-black/35">
                          {formatRelativeNotificationTime(notification.created_at)}
                        </span>
                      </span>
                      {content.meta ? (
                        <span className="mt-1 block text-xs font-semibold text-black/60">
                          {content.meta}
                        </span>
                      ) : null}
                      {content.text ? (
                        <span className="mt-1 block text-xs leading-5 text-black/50">
                          {content.text}
                        </span>
                      ) : null}
                    </span>
                  </NotificationLink>
                );
              })
            ) : (
              <div className="px-4 py-10 text-center">
                <p className="text-sm font-semibold text-ink">
                  Brak nowych powiadomień
                </p>
                <p className="mt-1 text-xs text-black/45">
                  Ważne zdarzenia pojawią się tutaj.
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-black/[0.06] p-3">
            <Link
              href="/notifications"
              className="block rounded-xl bg-brand-soft px-4 py-3 text-center text-sm font-semibold text-brand transition hover:bg-brand/10"
              onClick={() => setIsOpen(false)}
            >
              Zobacz wszystkie
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
