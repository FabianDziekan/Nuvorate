"use client";

import { useState } from "react";

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

export function AuthorVerificationList({
  reviews,
}: {
  reviews: AuthorVerificationReview[];
}) {
  const [selectedReview, setSelectedReview] =
    useState<AuthorVerificationReview | null>(null);

  return (
    <>
      {reviews.length > 0 ? (
        <div className="space-y-3">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="min-w-0 overflow-hidden rounded-2xl border border-black/[0.06] bg-[#FAFAFC] p-5 transition hover:-translate-y-0.5 hover:border-brand/20 hover:bg-white hover:shadow-card"
            >
              <button
                type="button"
                onClick={() => setSelectedReview(review)}
                className="block w-full text-left"
              >
                <div className="flex min-w-0 flex-col justify-between gap-4 lg:flex-row lg:items-start">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-sm font-bold text-brand shadow-sm">
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
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        review.rating <= 2
                          ? "bg-red-50 text-red-600"
                          : "bg-brand-soft text-brand"
                      }`}
                    >
                      {formatRating(review.rating)} ★
                    </span>
                    <span className="rounded-xl border border-black/[0.08] bg-white px-3.5 py-2.5 text-xs font-semibold text-black/55 transition hover:border-brand/30 hover:text-brand">
                      Sprawdź autora
                    </span>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-black/60">
                  {review.content}
                </p>
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

      {selectedReview && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Zamknij panel weryfikacji autora"
            className="absolute inset-0 bg-black/35"
            onClick={() => setSelectedReview(null)}
          />
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-[460px] flex-col overflow-y-auto border-l border-black/[0.08] bg-white p-6 shadow-[0_24px_80px_rgba(15,15,16,0.22)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-brand">
                  Weryfikacja autora
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  {selectedReview.authorName}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReview(null)}
                className="rounded-xl border border-black/[0.08] bg-white px-3 py-2 text-xs font-semibold text-black/45 transition hover:border-brand/30 hover:text-brand"
              >
                Zamknij
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-black/[0.06] bg-[#FAFAFC] p-4">
              <div className="flex flex-wrap items-center gap-2">
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
              <p className="mt-4 text-sm leading-6 text-black/60">
                {selectedReview.content}
              </p>
            </div>

            <section className="mt-6 rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm">
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
                  className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#4D4EE8]"
                >
                  Otwórz profil autora w Google
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="mt-5 w-full rounded-xl border border-black/[0.08] bg-[#FAFAFC] px-4 py-3 text-sm font-semibold text-black/30"
                >
                  Otwórz profil autora w Google
                </button>
              )}
            </section>

            <section className="mt-4 rounded-2xl border border-black/[0.06] bg-[#FAFAFC] p-5">
              <h3 className="text-sm font-semibold">
                Na co zwrócić uwagę?
              </h3>
              <ul className="mt-4 space-y-2 text-sm leading-6 text-black/55">
                {verificationHints.map((hint) => (
                  <li key={hint} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                    <span>{hint}</span>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      )}
    </>
  );
}
