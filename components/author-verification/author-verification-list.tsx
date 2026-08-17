"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

export type AuthorVerificationReview = {
  authorName: string;
  authorProfileUrl?: string | null;
  content: string;
  createdAt: string;
  id: string;
  rating: number;
  source: string;
  verificationStatus: "unverified" | "verified";
};

function formatReviewDate(createdAt: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(createdAt));
}

function formatRating(rating: number) {
  return rating.toLocaleString("pl-PL", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

const verificationHints = [
  "Czy autor posiada wiele opinii?",
  "Czy wystawia głównie oceny 1★?",
  "Czy opiniuje podobne firmy?",
  "Czy wygląda na prawdziwego klienta?",
  "Czy posiada aktywny profil Google?",
];

const mobileVerificationHints = [
  "Liczba opinii autora",
  "Rozkład ocen",
  "Podobne firmy",
  "Realność profilu",
  "Aktywność profilu",
];

export function AuthorVerificationList({
  reviews,
}: {
  reviews: AuthorVerificationReview[];
}) {
  const [selectedReview, setSelectedReview] =
    useState<AuthorVerificationReview | null>(null);

  useEffect(() => {
    if (!selectedReview) return;
    if (!window.matchMedia("(max-width: 768px)").matches) return;

    const previousOverflow = document.body.style.overflow;
    const previousOverscrollBehavior = document.body.style.overscrollBehavior;

    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.overscrollBehavior = previousOverscrollBehavior;
    };
  }, [selectedReview]);

  return (
    <>
      {reviews.length > 0 ? (
        <div className="space-y-3">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="relative min-w-0 overflow-hidden rounded-2xl border border-black/[0.06] bg-[#FAFAFC] p-3.5 transition hover:-translate-y-0.5 hover:border-brand/20 hover:bg-white hover:shadow-card min-[769px]:p-5"
            >
              <button
                type="button"
                onClick={() => setSelectedReview(review)}
                className="block w-full text-left"
              >
                <div className="flex min-w-0 flex-col justify-between gap-3 min-[769px]:gap-4 lg:flex-row lg:items-start">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-sm font-bold text-brand shadow-sm min-[769px]:h-10 min-[769px]:w-10">
                      {review.authorName.slice(0, 1).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {review.authorName}
                      </p>
                      <p className="mt-0.5 text-[11px] text-black/35">
                        {formatReviewDate(review.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="absolute right-8 top-3.5 flex shrink-0 flex-wrap items-center gap-2 min-[769px]:static">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        review.rating <= 2
                          ? "bg-red-50 text-red-600"
                          : "bg-brand-soft text-brand"
                      }`}
                    >
                      {formatRating(review.rating)} ★
                    </span>
                    <span className="hidden rounded-xl border border-black/[0.08] bg-white px-3.5 py-2.5 text-xs font-semibold text-black/55 transition hover:border-brand/30 hover:text-brand min-[769px]:inline-flex">
                      Sprawdź autora
                    </span>
                  </div>
                </div>
                <p className="mt-3 line-clamp-2 pr-5 text-sm leading-5 text-black/60 min-[769px]:mt-4 min-[769px]:pr-0 min-[769px]:leading-6">
                  {review.content}
                </p>
                <span className="absolute bottom-4 right-4 text-lg text-black/35 min-[769px]:hidden" aria-hidden="true">›</span>
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-black/[0.08] bg-[#FAFAFC] px-5 py-12 text-center">
          <p className="text-sm font-semibold">
            Brak opinii do weryfikacji.
          </p>
          <p className="mt-2 text-sm text-black/45">
            Gdy pojawią się opinie klientów, lista autorów będzie dostępna tutaj.
          </p>
        </div>
      )}

      {selectedReview && typeof document !== "undefined"
        ? createPortal(
        <div className="fixed inset-0 z-[110]">
          <button
            type="button"
            aria-label="Zamknij panel weryfikacji autora"
            className="fixed inset-0 bg-black/35"
            onClick={() => setSelectedReview(null)}
          />
          <aside className="fixed inset-x-0 bottom-0 z-[111] flex max-h-[88dvh] w-full flex-col overflow-y-auto overscroll-contain rounded-t-[28px] border border-black/[0.08] bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-16px_60px_rgba(15,15,16,0.2)] min-[769px]:absolute min-[769px]:inset-x-auto min-[769px]:right-0 min-[769px]:top-0 min-[769px]:h-full min-[769px]:max-h-none min-[769px]:max-w-[460px] min-[769px]:rounded-none min-[769px]:border-l min-[769px]:p-6 min-[769px]:shadow-[0_24px_80px_rgba(15,15,16,0.22)]">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-black/10 min-[769px]:hidden" />
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-brand">
                  Weryfikacja autora
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight min-[769px]:mt-2 min-[769px]:text-2xl">
                  {selectedReview.authorName}
                </h2>
                <p className="mt-1 text-xs text-black/45 min-[769px]:hidden">{formatRating(selectedReview.rating)} ★ · {formatReviewDate(selectedReview.createdAt)}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReview(null)}
                className="grid h-9 w-9 place-items-center rounded-xl text-lg text-black/45 transition hover:bg-black/[0.04] min-[769px]:h-auto min-[769px]:w-auto min-[769px]:border min-[769px]:border-black/[0.08] min-[769px]:bg-white min-[769px]:px-3 min-[769px]:py-2 min-[769px]:text-xs min-[769px]:font-semibold min-[769px]:hover:border-brand/30 min-[769px]:hover:text-brand"
              >
                <span className="min-[769px]:hidden">×</span><span className="max-[768px]:hidden">Zamknij</span>
              </button>
            </div>

            <div className="mt-4 rounded-2xl border border-black/[0.06] bg-[#FAFAFC] p-3.5 min-[769px]:mt-6 min-[769px]:p-4">
              <div className="hidden flex-wrap items-center gap-2 min-[769px]:flex">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    selectedReview.rating <= 2
                      ? "bg-red-50 text-red-600"
                      : "bg-brand-soft text-brand"
                  }`}
                >
                  {formatRating(selectedReview.rating)} ★
                </span>
                <span className="text-xs text-black/35">
                  {formatReviewDate(selectedReview.createdAt)}
                </span>
              </div>
              <p className="text-sm leading-5 text-black/60 min-[769px]:mt-4 min-[769px]:leading-6">
                {selectedReview.content}
              </p>
            </div>

            <section className="mt-4 rounded-2xl border border-black/[0.06] bg-white p-4 shadow-sm min-[769px]:mt-6 min-[769px]:p-5">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-black/35">
                Status
              </p>
              <p className="mt-2 text-sm font-semibold text-ink">
                Funkcja będzie dostępna po integracji z Google Business.
              </p>
              {selectedReview.authorProfileUrl ? (
                <a
                  href={selectedReview.authorProfileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#4D4EE8] min-[769px]:mt-5"
                >
                  Otwórz profil autora w Google
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="mt-4 w-full rounded-xl border border-black/[0.08] bg-[#FAFAFC] px-4 py-3 text-sm font-semibold text-black/30 min-[769px]:mt-5"
                >
                  Otwórz profil autora w Google
                </button>
              )}
            </section>

            <section className="mt-3 rounded-2xl border border-black/[0.06] bg-[#FAFAFC] p-4 min-[769px]:mt-4 min-[769px]:p-5">
              <h3 className="text-sm font-semibold">
                Na co zwrócić uwagę?
              </h3>
              <ul className="mt-3 space-y-1.5 text-sm leading-5 text-black/55 min-[769px]:mt-4 min-[769px]:space-y-2 min-[769px]:leading-6">
                {(mobileVerificationHints).map((hint, index) => (
                  <li key={hint} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                    <span className="min-[769px]:hidden">{hint}</span><span className="max-[768px]:hidden">{verificationHints[index]}</span>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>,
        document.body,
      )
        : null}
    </>
  );
}
