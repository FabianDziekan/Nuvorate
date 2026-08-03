export function BusinessNavBadge({ show }: { show: boolean }) {
  if (!show) {
    return null;
  }

  return (
    <span
      aria-label="Dostępne w planie Business"
      className="business-nav-lock group/business-lock relative inline-grid h-5 w-5 shrink-0 place-items-center rounded-md text-brand outline-none transition-colors hover:bg-brand/10 focus-visible:bg-brand/10 focus-visible:ring-2 focus-visible:ring-brand/35"
      role="img"
      tabIndex={0}
    >
      <svg
        aria-hidden="true"
        className="h-3 w-3"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="5" y="10" width="14" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </svg>
      <span
        role="tooltip"
        className="pointer-events-none absolute right-0 top-full z-50 mt-2 w-max max-w-48 translate-y-1 rounded-lg bg-ink px-2.5 py-1.5 text-center text-[10px] font-medium normal-case tracking-normal text-white opacity-0 shadow-card transition group-hover/business-lock:translate-y-0 group-hover/business-lock:opacity-100 group-focus-visible/business-lock:translate-y-0 group-focus-visible/business-lock:opacity-100"
      >
        Dostępne w planie Business
      </span>
    </span>
  );
}
