import Link from "next/link";

export function BrandLogo({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5" aria-label="NuvoRate">
      <img
        src="/brand/nuvorate-logo.png"
        alt=""
        aria-hidden="true"
        className="h-10 w-10 shrink-0 rounded-xl object-contain"
      />
      <span className={`text-[19px] font-bold tracking-[-0.04em] ${inverse ? "text-white" : "text-ink"}`}>
        NuvoRate
      </span>
    </Link>
  );
}
