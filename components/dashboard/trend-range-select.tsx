"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type TrendRange = "30d" | "3m" | "12m";

const trendRangeOptions: Array<{ label: string; value: TrendRange }> = [
  { label: "Ostatnie 30 dni", value: "30d" },
  { label: "Ostatnie 3 miesiące", value: "3m" },
  { label: "Ostatnie 12 miesięcy", value: "12m" },
];

export function TrendRangeSelect({ value }: { value: TrendRange }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <select
      aria-label="Zakres wykresu nowych opinii"
      className="hidden rounded-xl border border-black/[0.08] bg-white px-4 py-2.5 text-sm font-medium text-black/55 outline-none transition hover:border-brand/20 focus:border-brand/30 focus:ring-4 focus:ring-brand/10 sm:block"
      value={value}
      onChange={(event) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("trend_range", event.target.value);
        router.push(`${pathname}?${params.toString()}`);
      }}
    >
      {trendRangeOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
