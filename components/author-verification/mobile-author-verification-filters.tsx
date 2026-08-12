"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

const ratings = ["all", "5", "4", "3", "2", "1"] as const;
const statuses = [
  { label: "Wszystkie", value: "all" },
  { label: "Niezweryfikowane", value: "unverified" },
  { label: "Zweryfikowane", value: "verified" },
] as const;

const sortOptions = [
  { label: "Najnowsze", value: "newest" },
  { label: "Najstarsze", value: "oldest" },
  { label: "Najniższa ocena", value: "lowest" },
  { label: "Najwyższa ocena", value: "highest" },
] as const;

export function MobileAuthorVerificationFilters({
  searchQuery,
  selectedRating,
  selectedSort,
  selectedStatus,
}: {
  searchQuery: string;
  selectedRating: string;
  selectedSort: string;
  selectedStatus: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(selectedRating);
  const [status, setStatus] = useState(selectedStatus);

  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex h-9 items-center gap-2 rounded-xl border border-black/[0.08] bg-white px-3 text-xs font-semibold text-brand transition hover:border-brand/30 focus:outline-none focus:ring-4 focus:ring-brand/10 min-[769px]:hidden"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M4 7h16M4 12h16M4 17h16" />
          <circle cx="9" cy="7" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="15" cy="12" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="11" cy="17" r="1.5" fill="currentColor" stroke="none" />
        </svg>
        Filtry
      </button>

      {isOpen && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-[100] bg-ink/20 min-[769px]:hidden"
              role="presentation"
              onMouseDown={(event) => {
                if (event.currentTarget === event.target) setIsOpen(false);
              }}
            >
              <form
                action="/author-verification"
                className="mobile-bottom-sheet-enter fixed inset-x-0 bottom-0 z-[101] max-h-[70vh] overflow-y-auto rounded-t-[28px] border border-black/[0.06] bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-16px_60px_rgba(15,15,16,0.2)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.12em] text-black/35">Weryfikacja autora</p>
                    <h2 className="mt-1 text-xl font-semibold tracking-tight">Filtry</h2>
                  </div>
                  <button type="button" onClick={() => setIsOpen(false)} className="grid h-9 w-9 place-items-center rounded-xl text-lg text-black/45 transition hover:bg-black/[0.04] hover:text-ink focus:outline-none focus:ring-4 focus:ring-brand/10" aria-label="Zamknij filtry">×</button>
                </div>

                <input type="hidden" name="rating" value={rating} />
                <input type="hidden" name="status" value={status} />

                <label className="mt-5 block">
                  <span className="text-xs font-semibold text-black/45">Wyszukiwarka</span>
                  <input name="q" defaultValue={searchQuery} placeholder="Szukaj autora..." className="mt-2 w-full rounded-2xl border border-black/[0.08] bg-[#FAFAFC] px-4 py-3 text-sm outline-none transition focus:border-brand/30 focus:ring-4 focus:ring-brand/10" />
                </label>

                <label className="mt-5 block">
                  <span className="text-xs font-semibold text-black/45">Sortowanie</span>
                  <select name="sort" defaultValue={selectedSort} className="mt-2 w-full rounded-2xl border border-black/[0.08] bg-[#FAFAFC] px-4 py-3 text-sm outline-none transition focus:border-brand/30 focus:ring-4 focus:ring-brand/10">
                    {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </label>

                <fieldset className="mt-5">
                  <legend className="text-xs font-semibold text-black/45">Ocena</legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {ratings.map((value) => (
                      <button key={value} type="button" onClick={() => setRating(value)} className={`rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${rating === value ? "bg-brand text-white shadow-sm" : "border border-black/[0.08] bg-[#FAFAFC] text-black/50"}`}>
                        {value === "all" ? "Wszystkie" : `${value} ★`}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="mt-5">
                  <legend className="text-xs font-semibold text-black/45">Status</legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {statuses.map((option) => (
                      <button key={option.value} type="button" onClick={() => setStatus(option.value)} className={`rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${status === option.value ? "bg-brand text-white shadow-sm" : "border border-black/[0.08] bg-[#FAFAFC] text-black/50"}`}>
                        {option.label}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <button type="submit" className="mt-6 w-full rounded-2xl bg-brand px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#4D4EE8] focus:outline-none focus:ring-4 focus:ring-brand/20">
                  Zastosuj
                </button>
              </form>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
