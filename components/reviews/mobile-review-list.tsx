"use client";

import { useEffect, useState } from "react";
import { ReviewResponseForm } from "@/components/dashboard/review-response-form";

type MobileReview = {
  authorName: string;
  content: string;
  createdAtLabel: string;
  id: string;
  rating: number;
  sourceLabel: string;
};

const reviewsPerBatch = 10;

export function MobileReviewList({ reviews }: { reviews: MobileReview[] }) {
  const [selectedReview, setSelectedReview] = useState<MobileReview | null>(null);
  const [visibleCount, setVisibleCount] = useState(reviewsPerBatch);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const visibleReviews = reviews.slice(0, visibleCount);
  const hasMoreReviews = visibleCount < reviews.length;

  useEffect(() => {
    if (!selectedReview) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedReview(null);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedReview]);

  function loadMoreReviews() {
    if (isLoadingMore || !hasMoreReviews) return;

    setIsLoadingMore(true);
    window.requestAnimationFrame(() => {
      setVisibleCount((current) => Math.min(current + reviewsPerBatch, reviews.length));
      setIsLoadingMore(false);
    });
  }

  return (
    <>
      <div className="mt-4 space-y-2 min-[769px]:hidden">
        {visibleReviews.map((review) => (
          <article
            key={review.id}
            role="button"
            tabIndex={0}
            onClick={() => setSelectedReview(review)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setSelectedReview(review);
              }
            }}
            className="rounded-2xl border border-black/[0.06] bg-[#FAFAFC] p-3 text-left shadow-sm transition hover:border-brand/20 focus:outline-none focus:ring-4 focus:ring-brand/10"
          >
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-xs font-bold text-brand shadow-sm">
                {review.authorName.slice(0, 1).toUpperCase()}
              </span>
              <p className="min-w-0 flex-1 truncate text-sm font-semibold">{review.authorName}</p>
              <span className="rounded-full border border-black/[0.06] bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-black/40">
                {review.sourceLabel}
              </span>
              <span className="rounded-full bg-brand-soft px-2 py-1 text-xs font-semibold text-brand">
                {review.rating.toLocaleString("pl-PL", {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })} ★
              </span>
            </div>
            <p className="mt-1.5 text-[11px] text-black/35">{review.createdAtLabel}</p>
            <p className="mt-2 line-clamp-2 text-sm leading-5 text-black/60">{review.content}</p>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setSelectedReview(review);
              }}
              className="mt-3 text-xs font-semibold text-brand transition hover:text-[#4D4EE8] focus:outline-none focus:ring-4 focus:ring-brand/10"
            >
              Wygeneruj odpowiedź
            </button>
          </article>
        ))}
        <div className="border-t border-black/[0.06] pt-4 text-center">
          {hasMoreReviews ? (
            <button
              type="button"
              disabled={isLoadingMore}
              onClick={loadMoreReviews}
              className="inline-flex rounded-xl border border-black/[0.08] bg-white px-4 py-2.5 text-xs font-semibold text-black/55 transition hover:border-brand/30 hover:text-brand disabled:cursor-wait disabled:opacity-60"
            >
              {isLoadingMore ? "Ładowanie..." : "Załaduj więcej"}
            </button>
          ) : null}
          <p className="mt-3 text-xs font-medium text-black/35">
            Wyświetlono {Math.min(visibleCount, reviews.length)} z {reviews.length} opinii
          </p>
        </div>
      </div>

      {selectedReview ? (
        <div
          className="fixed inset-0 z-[80] flex items-end bg-ink/35 p-3 backdrop-blur-sm min-[769px]:hidden"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) {
              setSelectedReview(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-details-title"
            className="analysis-context-alert-enter max-h-[min(680px,calc(100vh-24px))] w-full overflow-y-auto rounded-[28px] border border-black/[0.06] bg-white p-5 shadow-[0_-16px_60px_rgba(15,15,16,0.2)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-sm font-bold text-brand shadow-sm">
                  {selectedReview.authorName.slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <h2 id="review-details-title" className="truncate text-base font-semibold">
                    {selectedReview.authorName}
                  </h2>
                  <p className="mt-0.5 text-[11px] text-black/35">{selectedReview.createdAtLabel}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReview(null)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-lg text-black/45 transition hover:bg-black/[0.04] hover:text-ink focus:outline-none focus:ring-4 focus:ring-brand/10"
                aria-label="Zamknij szczegóły opinii"
              >
                ×
              </button>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <span className="rounded-full border border-black/[0.06] bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-black/40">
                {selectedReview.sourceLabel}
              </span>
              <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand">
                {selectedReview.rating.toLocaleString("pl-PL", {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })} ★
              </span>
            </div>
            <p className="mt-5 text-sm leading-6 text-black/60">{selectedReview.content}</p>

            <div className="mt-5 border-t border-black/[0.06] pt-4">
              <ReviewResponseForm
                reviewId={selectedReview.id}
                mobileLabel="Wygeneruj odpowiedź"
              />
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
