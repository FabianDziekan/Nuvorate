export type PaginationWindow = {
  currentPage: number;
  end: number;
  start: number;
  totalPages: number;
};

/**
 * Keeps page parsing and Supabase's inclusive `range` window consistent for
 * every server-paginated dashboard list.
 */
export function getPaginationWindow({
  pageSize,
  requestedPage,
  totalItems,
}: {
  pageSize: number;
  requestedPage: number;
  totalItems: number;
}): PaginationWindow {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Number.isInteger(requestedPage)
    ? Math.min(Math.max(requestedPage, 1), totalPages)
    : 1;
  const start = (currentPage - 1) * pageSize;

  return {
    currentPage,
    end: start + pageSize - 1,
    start,
    totalPages,
  };
}
