"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateAutomaticAnalysisSettings } from "@/app/dashboard/actions";

type AutomaticAnalysisSettingsProps = {
  enabled: boolean;
  frequencyDays: number;
  lastSkipReason: string | null;
  nextRunAt: string | null;
};

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
  }).format(new Date(value));
}

export function AutomaticAnalysisSettings({
  enabled: initialEnabled,
  frequencyDays: initialFrequencyDays,
  lastSkipReason,
  nextRunAt,
}: AutomaticAnalysisSettingsProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [frequencyDays, setFrequencyDays] = useState(initialFrequencyDays);
  const [message, setMessage] = useState<string | null>(null);
  const [isEditingFrequency, setIsEditingFrequency] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    setEnabled(initialEnabled);
    setFrequencyDays(initialFrequencyDays);
  }, [initialEnabled, initialFrequencyDays]);

  function save(nextEnabled: boolean, nextFrequencyDays: number) {
    setMessage(null);
    startTransition(async () => {
      const result = await updateAutomaticAnalysisSettings({
        enabled: nextEnabled,
        frequencyDays: nextFrequencyDays,
      });

      if (result.success) {
        setEnabled(nextEnabled);
        setFrequencyDays(nextFrequencyDays);
        setIsEditingFrequency(false);
        setMessage("Ustawienia automatycznej analizy zostały zapisane.");
        router.refresh();
        return;
      }

      setMessage(result.error ?? "Nie udało się zapisać ustawień.");
    });
  }

  return (
    <section className="rounded-[22px] border border-black/[0.06] bg-white px-5 py-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/35">
            Automatyczna analiza
          </p>
          <p className="mt-1 text-sm text-black/50" aria-live="polite">
            {isPending
              ? "Zapisywanie ustawień…"
              : enabled
                ? `Włączona · co ${frequencyDays} dni`
                : "Wyłączona"}
          </p>
          {enabled ? (
            <p className="mt-0.5 text-xs text-black/40">
              Następna analiza: {formatDate(nextRunAt)}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {enabled ? (
            <button
              type="button"
              onClick={() => setIsEditingFrequency((current) => !current)}
              disabled={isPending}
              aria-expanded={isEditingFrequency}
              className="text-sm font-semibold text-brand transition hover:text-brand-dark focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/15 disabled:opacity-60"
            >
              Zmień
            </button>
          ) : null}
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            disabled={isPending}
            onClick={() => save(!enabled, frequencyDays)}
            className={`nuvorate-switch-track inline-flex h-8 w-14 items-center rounded-full p-1 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/20 disabled:cursor-wait disabled:opacity-60 ${enabled ? "nuvorate-switch-track-on bg-brand" : "bg-black/10"}`}
          >
            <span className={`nuvorate-switch-thumb h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${enabled ? "translate-x-6" : "translate-x-0"}`} />
            <span className="sr-only">{enabled ? "Wyłącz" : "Włącz"} automatyczną analizę</span>
          </button>
        </div>
      </div>

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${enabled && isEditingFrequency ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">
          <div className="flex flex-wrap gap-2 border-t border-black/[0.06] pt-3">
            {[7, 14, 30].map((option) => (
              <button
                key={option}
                type="button"
                disabled={isPending}
                onClick={() => save(true, option)}
                className={`rounded-xl border px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/15 disabled:opacity-60 ${frequencyDays === option ? "border-brand bg-brand-soft text-brand" : "border-black/[0.08] text-black/55 hover:border-brand/35 hover:text-brand"}`}
              >
                Co {option} dni
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-black/40">
        Automatyczna analiza wykorzystuje limit analiz planu Business.
      </p>
      {lastSkipReason ? (
        <p className="mt-3 rounded-xl bg-brand-soft px-3 py-2 text-xs leading-5 text-brand">
          {lastSkipReason}
        </p>
      ) : null}
      {message ? <p className="mt-3 text-xs font-medium text-black/50">{message}</p> : null}
    </section>
  );
}
