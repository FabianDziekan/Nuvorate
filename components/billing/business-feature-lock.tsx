import Link from "next/link";
import type { ReactNode } from "react";

type BusinessFeatureLockProps = {
  title: string;
  description: string;
  preview?: ReactNode;
  className?: string;
};

function LockIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="10" width="16" height="11" rx="3" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export function BusinessFeatureLock({
  title,
  description,
  preview,
  className = "",
}: BusinessFeatureLockProps) {
  return (
    <section
      className={`business-feature-lock relative isolate overflow-hidden rounded-[24px] border border-black/[0.06] bg-white shadow-card ${className}`}
      aria-label={`${title} — funkcja planu Business`}
    >
      {preview ? (
        <div
          aria-hidden="true"
          className="pointer-events-none select-none"
          inert
        >
          {preview}
        </div>
      ) : null}

      <div className="business-feature-lock-overlay absolute inset-0 z-10 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-xl rounded-[22px] border border-white/70 bg-white/88 p-5 text-center shadow-soft backdrop-blur-xl sm:p-7">
          <div className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-brand-soft text-brand">
            <LockIcon />
          </div>
          <span className="mt-4 inline-flex rounded-full border border-brand/15 bg-brand-soft px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-brand">
            Plan Business
          </span>
          <h2 className="mt-4 text-xl font-semibold tracking-tight text-ink sm:text-2xl">
            {title}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-black/50">
            {description}
          </p>
          <Link
            href="/checkout?plan=business"
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-purple outline-none transition hover:bg-brand-dark focus-visible:ring-4 focus-visible:ring-brand/25"
          >
            Przejdź na Business
          </Link>
        </div>
      </div>
    </section>
  );
}
