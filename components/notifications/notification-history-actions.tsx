"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  clearNotificationHistory,
  markAllNotificationsAsRead,
} from "@/app/notifications/actions";

function TrashIcon({ className = "h-4 w-4" }: { className?: string }) {
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
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

export function NotificationHistoryActions({
  totalCount,
  unreadCount,
}: {
  totalCount: number;
  unreadCount: number;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(unreadCount > 0);
  const [isMarkingRead, startMarkingReadTransition] = useTransition();

  useEffect(() => {
    setHasUnread(unreadCount > 0);
  }, [unreadCount]);

  function handleMarkAllAsRead() {
    if (!hasUnread || isMarkingRead) {
      return;
    }

    setHasUnread(false);

    startMarkingReadTransition(async () => {
      try {
        await markAllNotificationsAsRead();
        router.refresh();
      } catch (error) {
        console.error("Mark all notifications as read failed", error);
        setHasUnread(true);
      }
    });
  }

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <button
          type="button"
          disabled={!hasUnread || isMarkingRead}
          onClick={handleMarkAllAsRead}
          className="w-full rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-black disabled:cursor-not-allowed disabled:bg-black/20 sm:w-auto"
        >
          {hasUnread ? "Oznacz wszystkie jako przeczytane" : "✓ Wszystkie przeczytane"}
        </button>
        <button
          type="button"
          disabled={totalCount === 0}
          onClick={() => setConfirmOpen(true)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-5 py-3 text-sm font-semibold text-red-600 shadow-sm transition hover:border-red-200 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
        >
          <TrashIcon />
          Wyczyść historię
        </button>
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-5">
          <button
            type="button"
            aria-label="Zamknij potwierdzenie"
            className="absolute inset-0 cursor-default"
            onClick={() => setConfirmOpen(false)}
          />
          <section className="relative w-full max-w-md rounded-[28px] border border-black/[0.06] bg-white p-6 shadow-[0_24px_80px_rgba(15,15,16,0.22)]">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-red-50 text-red-600">
              <TrashIcon className="h-5 w-5" />
            </div>
            <h2 className="mt-5 text-xl font-semibold tracking-tight text-ink">
              Wyczyścić historię powiadomień?
            </h2>
            <p className="mt-3 text-sm leading-6 text-black/55">
              Usunięte zostaną wszystkie zapisane powiadomienia. Nie wpłynie to
              na opinie, analizy ani dane firmy.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="rounded-xl border border-black/[0.08] bg-white px-4 py-3 text-sm font-semibold text-black/55 transition hover:border-brand/30 hover:text-brand"
              >
                Anuluj
              </button>
              <form action={clearNotificationHistory}>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 sm:w-auto"
                >
                  Wyczyść historię
                </button>
              </form>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
