"use client";

import { useState, useTransition } from "react";
import { syncGoogleReviews } from "@/app/dashboard/actions";

function formatSyncTime(lastSyncedAt: string | null) {
  if (!lastSyncedAt) {
    return "Ostatnia synchronizacja: brak danych";
  }

  const diffInSeconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(lastSyncedAt).getTime()) / 1000),
  );

  if (diffInSeconds < 60) {
    return "Ostatnia synchronizacja: przed chwilą";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);

  if (diffInMinutes === 1) {
    return "Ostatnia synchronizacja: 1 min temu";
  }

  if (diffInMinutes < 60) {
    return `Ostatnia synchronizacja: ${diffInMinutes} min temu`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);

  if (diffInHours === 1) {
    return "Ostatnia synchronizacja: 1 godz. temu";
  }

  return `Ostatnia synchronizacja: ${diffInHours} godz. temu`;
}

export function GoogleSyncButton() {
  const [isPending, startTransition] = useTransition();
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const isSyncing = isPending;

  function handleSync() {
    setMessage("");
    setError("");

    startTransition(async () => {
      try {
        const [result] = await Promise.all([
          syncGoogleReviews(),
          new Promise((resolve) => window.setTimeout(resolve, 700)),
        ]);

        setLastSyncedAt(result.lastSyncedAt);
        setMessage(
          result.success
            ? `Synchronizacja zakończona. ${result.message}.`
            : result.message,
        );
      } catch {
        setError("Nie udało się uruchomić synchronizacji.");
      }
    });
  }

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <button
        type="button"
        onClick={handleSync}
        disabled={isSyncing}
        className="button-primary self-start disabled:cursor-wait disabled:opacity-70 sm:self-auto"
      >
        {isSyncing ? "Synchronizuję..." : "Synchronizuj z Google"}
      </button>
      <div className="w-full min-w-[220px] sm:text-right">
        <p className="text-xs font-medium text-black/40">
          {formatSyncTime(lastSyncedAt)}
        </p>
        {isSyncing ? (
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-brand-soft">
            <div className="h-full w-2/3 animate-pulse rounded-full bg-brand" />
          </div>
        ) : null}
        {message ? (
          <p className="mt-1 text-xs font-semibold text-brand">{message}</p>
        ) : null}
        {error ? (
          <p className="mt-1 text-xs font-semibold text-red-600">{error}</p>
        ) : null}
      </div>
    </div>
  );
}
