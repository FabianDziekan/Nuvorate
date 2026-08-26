"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function GoogleSyncButton({
  isGoogleConnected = false,
}: {
  isGoogleConnected?: boolean;
}) {
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function handleSync() {
    if (isSyncing) return;

    setMessage("");
    setError("");
    setIsSyncing(true);

    try {
      const response = await fetch("/api/google/sync-reviews", {
        method: "POST",
      });
      const result = await response.json() as {
        error?: string;
        success?: boolean;
        synced?: number;
      };

      if (!response.ok || !result.success) {
        setError(result.error ?? "Nie udało się uruchomić synchronizacji.");
        return;
      }

      const reviewCount = result.synced ?? 0;
      setMessage(
        reviewCount === 1
          ? "Zsynchronizowano 1 opinię z Google."
          : `Zsynchronizowano ${reviewCount} opinii z Google.`,
      );
      router.refresh();
    } catch {
      setError("Nie udało się uruchomić synchronizacji.");
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <>
      <div className="hidden flex-col items-start gap-2 min-[769px]:flex sm:items-end">
      <button
        type="button"
        onClick={handleSync}
        disabled={isSyncing}
        className="button-primary self-start disabled:cursor-wait disabled:opacity-70 sm:self-auto"
      >
        {isSyncing ? "Synchronizuję..." : "Synchronizuj z Google"}
      </button>
      <div className="w-full min-w-[220px] sm:text-right">
        <p className="text-xs font-medium text-black/40">Synchronizacja opinii Google</p>
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
      {!isGoogleConnected ? (
        <Link
          href="/settings"
          className="rounded-xl border border-brand/15 bg-brand-soft px-3 py-2 text-xs font-semibold text-brand min-[769px]:hidden"
        >
          Połącz profil Google Business w Ustawieniach.
        </Link>
      ) : null}
    </>
  );
}
