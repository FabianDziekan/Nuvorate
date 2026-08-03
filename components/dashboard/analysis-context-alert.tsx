"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type { AnalysisFeedback } from "@/lib/analysis-feedback";

export function AnalysisContextAlert({
  feedback,
}: {
  feedback: AnalysisFeedback | null;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(Boolean(feedback));
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("ai_error");
    const query = nextParams.toString();
    window.history.replaceState(
      window.history.state,
      "",
      query ? `${pathname}?${query}` : pathname,
    );

    const hideTimer = window.setTimeout(() => {
      setLeaving(true);
    }, 9_700);
    const removeTimer = window.setTimeout(() => {
      setVisible(false);
    }, 10_000);

    return () => {
      window.clearTimeout(hideTimer);
      window.clearTimeout(removeTimer);
    };
  }, [feedback, pathname, searchParams]);

  function dismiss() {
    setLeaving(true);
    window.setTimeout(() => setVisible(false), 220);
  }

  if (!feedback || !visible) {
    return null;
  }

  return (
    <aside
      aria-live="polite"
      className={`analysis-context-alert fixed inset-x-4 top-20 z-50 mx-auto max-w-xl rounded-[22px] border border-brand/15 bg-white/95 p-4 shadow-soft backdrop-blur-xl sm:left-auto sm:right-6 sm:mx-0 sm:w-[min(430px,calc(100vw-3rem))] sm:p-5 ${
        leaving ? "analysis-context-alert-leave" : "analysis-context-alert-enter"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
          <svg
            aria-hidden="true"
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5" />
            <path d="M12 17h.01" />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink">{feedback.title}</p>
          <p className="mt-1 text-xs leading-5 text-black/50">
            {feedback.description}
          </p>
          {feedback.showBusinessCta ? (
            <Link
              href="/checkout?plan=business"
              className="analysis-context-alert-cta mt-3 inline-flex min-h-10 items-center justify-center rounded-xl bg-brand px-4 py-2 text-xs font-semibold text-white outline-none transition hover:bg-brand-dark focus-visible:ring-4 focus-visible:ring-brand/25"
            >
              Przejdź na Business
            </Link>
          ) : null}
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-black/35 outline-none transition hover:bg-black/[0.04] hover:text-ink focus-visible:ring-4 focus-visible:ring-brand/15"
          aria-label="Zamknij komunikat"
        >
          <svg
            aria-hidden="true"
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="m6 6 12 12" />
            <path d="m18 6-12 12" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
