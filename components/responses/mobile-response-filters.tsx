"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

type Filter = {
  label: string;
  value: string;
};

export function MobileResponseFilters({
  filters,
  selectedFilter,
}: {
  filters: Filter[];
  selectedFilter: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const activeFilter = filters.find((filter) => filter.value === selectedFilter);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previousOverscrollBehavior = document.body.style.overscrollBehavior;
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      document.body.style.overscrollBehavior = previousOverscrollBehavior;
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-black/[0.08] bg-white px-3 text-left transition hover:border-brand/30 focus:outline-none focus:ring-4 focus:ring-brand/10 min-[769px]:hidden"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-brand" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M4 7h16M4 12h16M4 17h16" />
          <circle cx="9" cy="7" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="15" cy="12" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="11" cy="17" r="1.5" fill="currentColor" stroke="none" />
        </svg>
        <span>
          <span className="block text-xs font-semibold text-ink">Filtruj opinie</span>
          <span className="block text-[10px] text-black/40">{activeFilter?.label ?? "Wszystkie opinie"}</span>
        </span>
      </button>

      {isOpen && typeof document !== "undefined"
        ? createPortal(
        <div
          className="fixed inset-0 z-[110] bg-ink/20 min-[769px]:hidden"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setIsOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="response-filters-title"
            className="mobile-bottom-sheet-enter fixed inset-x-0 bottom-0 z-[111] max-h-[88dvh] overflow-y-auto overscroll-contain rounded-t-[28px] border border-black/[0.06] bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-16px_60px_rgba(15,15,16,0.2)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-black/35">Lista odpowiedzi</p>
                <h2 id="response-filters-title" className="mt-1 text-xl font-semibold tracking-tight">Filtruj opinie</h2>
              </div>
              <button type="button" onClick={() => setIsOpen(false)} className="grid h-9 w-9 place-items-center rounded-xl text-lg text-black/45 transition hover:bg-black/[0.04] hover:text-ink focus:outline-none focus:ring-4 focus:ring-brand/10" aria-label="Zamknij filtry">×</button>
            </div>

            <div className="mt-5 grid gap-2">
              {filters.map((filter) => {
                const active = selectedFilter === filter.value;
                const href = filter.value === "all" ? "/responses" : `/responses?filter=${filter.value}`;

                return (
                  <Link
                    key={filter.value}
                    href={href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                      active
                        ? "border-brand bg-brand-soft text-brand"
                        : "border-black/[0.06] bg-[#FAFAFC] text-black/60 hover:border-brand/25 hover:text-brand"
                    }`}
                  >
                    {filter.label}
                    {active ? <span aria-hidden="true">✓</span> : null}
                  </Link>
                );
              })}
            </div>
          </section>
        </div>,
        document.body,
      )
        : null}
    </>
  );
}
