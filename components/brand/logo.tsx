import Link from "next/link";

export function BrandLogo({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5" aria-label="NuvoRate">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white shadow-sm">
        <svg aria-hidden="true" viewBox="0 0 32 32" className="h-6 w-6">
          <path
            d="M8 23V9l8 10V9M16 23l8-14v14"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span
        className={`text-[19px] font-bold tracking-[-0.04em] ${
          inverse ? "text-white" : "text-ink"
        }`}
      >
        NuvoRate
      </span>
    </Link>
  );
}
