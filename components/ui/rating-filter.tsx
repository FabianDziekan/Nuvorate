import Link from "next/link";

export const ratingFilterValues = ["all", "5", "4", "3", "2", "1"] as const;

export type RatingFilterValue = (typeof ratingFilterValues)[number];

export function RatingFilter({
  buildHref,
  selectedRating,
}: {
  buildHref: (rating: RatingFilterValue) => string;
  selectedRating: string;
}) {
  return (
    <div className="flex flex-wrap gap-2" aria-label="Filtr ocen">
      {ratingFilterValues.map((rating) => {
        const active = selectedRating === rating;

        return (
          <Link
            key={rating}
            href={buildHref(rating)}
            className={`rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
              active
                ? "bg-brand text-white shadow-sm"
                : "border border-black/[0.08] bg-white text-black/50 hover:border-brand/30 hover:text-brand"
            }`}
          >
            {rating === "all" ? "Wszystkie" : `${rating} ★`}
          </Link>
        );
      })}
    </div>
  );
}
