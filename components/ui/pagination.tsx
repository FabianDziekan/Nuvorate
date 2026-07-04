import Link from "next/link";

type PaginationProps = {
  buildHref: (page: number) => string;
  currentPage: number;
  itemLabel?: string;
  pageSize: number;
  totalItems: number;
};

function paginationPages(currentPage: number, totalPages: number) {
  const pages = new Set([1, totalPages]);

  for (let page = currentPage - 1; page <= currentPage + 1; page += 1) {
    if (page >= 1 && page <= totalPages) {
      pages.add(page);
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

export function Pagination({
  buildHref,
  currentPage,
  itemLabel = "opinii",
  pageSize,
  totalItems,
}: PaginationProps) {
  if (totalItems <= 0) {
    return null;
  }

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const pageStart = (currentPage - 1) * pageSize;
  const pageEnd = pageStart + pageSize;
  const visibleStart = pageStart + 1;
  const visibleEnd = Math.min(pageEnd, totalItems);
  const pages = paginationPages(currentPage, totalPages);

  return (
    <div className="border-t border-black/[0.06] pt-5">
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-xs font-medium text-black/35">
          Wyświetlanie {visibleStart}–{visibleEnd} z {totalItems} {itemLabel}
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href={buildHref(currentPage - 1)}
            aria-disabled={currentPage === 1}
            className={`rounded-xl border border-black/[0.08] px-3.5 py-2.5 text-xs font-semibold transition ${
              currentPage === 1
                ? "pointer-events-none text-black/25"
                : "bg-white text-black/50 hover:border-brand/30 hover:text-brand"
            }`}
          >
            ← Poprzednia
          </Link>
          <div className="flex flex-wrap justify-center gap-1.5">
            {pages.map((page, index) => {
              const previousPage = pages[index - 1];
              const showGap = previousPage && page - previousPage > 1;

              return (
                <span key={page} className="flex items-center gap-1.5">
                  {showGap && (
                    <span className="px-1 text-xs font-semibold text-black/25">
                      ...
                    </span>
                  )}
                  <Link
                    href={buildHref(page)}
                    className={`grid h-9 min-w-9 place-items-center rounded-xl px-3 text-xs font-semibold transition ${
                      currentPage === page
                        ? "bg-brand text-white shadow-sm"
                        : "border border-black/[0.08] bg-white text-black/50 hover:border-brand/30 hover:text-brand"
                    }`}
                  >
                    {page}
                  </Link>
                </span>
              );
            })}
          </div>
          <Link
            href={buildHref(currentPage + 1)}
            aria-disabled={currentPage === totalPages}
            className={`rounded-xl border border-black/[0.08] px-3.5 py-2.5 text-xs font-semibold transition ${
              currentPage === totalPages
                ? "pointer-events-none text-black/25"
                : "bg-white text-black/50 hover:border-brand/30 hover:text-brand"
            }`}
          >
            Następna →
          </Link>
        </div>
      </div>
    </div>
  );
}
