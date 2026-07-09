"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export type TrendRange = "30d" | "3m" | "12m";

type TrendRangeSelectProps = {
  from?: string;
  isCustom: boolean;
  label: string;
  to?: string;
  value: TrendRange;
};

const trendRangeOptions: Array<{ label: string; value: TrendRange }> = [
  { label: "Ostatnie 30 dni", value: "30d" },
  { label: "Ostatnie 3 miesiące", value: "3m" },
  { label: "Ostatnie 12 miesięcy", value: "12m" },
];

function formatInputDate(value?: string) {
  return typeof value === "string" ? value : "";
}

export function TrendRangeSelect({
  from,
  isCustom,
  label,
  to,
  value,
}: TrendRangeSelectProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState(formatInputDate(from));
  const [customTo, setCustomTo] = useState(formatInputDate(to));
  const [error, setError] = useState("");

  useEffect(() => {
    setCustomFrom(formatInputDate(from));
    setCustomTo(formatInputDate(to));
  }, [from, to]);

  function pushParams(nextParams: URLSearchParams) {
    const query = nextParams.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function selectPreset(nextValue: TrendRange) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("trend_range", nextValue);
    params.delete("from");
    params.delete("to");
    setError("");
    setIsOpen(false);
    pushParams(params);
  }

  function applyCustomRange() {
    if (!customFrom || !customTo || customTo < customFrom) {
      setError("Podaj poprawny zakres dat.");
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.delete("trend_range");
    params.set("from", customFrom);
    params.set("to", customTo);
    setError("");
    setIsOpen(false);
    pushParams(params);
  }

  return (
    <div className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="rounded-xl border border-black/[0.08] bg-white px-4 py-2.5 text-sm font-medium text-black/55 outline-none transition hover:border-brand/20 focus:border-brand/30 focus:ring-4 focus:ring-brand/10"
      >
        {label}
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-[320px] rounded-[22px] border border-black/[0.08] bg-white p-3 shadow-[0_20px_70px_rgba(15,15,16,0.14)]">
          <div className="space-y-1">
            {trendRangeOptions.map((option) => {
              const active = !isCustom && option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => selectPreset(option.value)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold ${
                    active
                      ? "bg-brand-soft text-brand"
                      : "text-black/55 hover:bg-black/[0.035] hover:text-ink"
                  }`}
                >
                  {option.label}
                  {active ? <span className="text-xs">Wybrane</span> : null}
                </button>
              );
            })}
          </div>

          <div className="mt-3 border-t border-black/[0.06] pt-3">
            <p className="px-1 text-xs font-semibold uppercase tracking-[0.12em] text-black/35">
              Zakres niestandardowy
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <label className="space-y-1.5">
                <span className="text-[11px] font-semibold text-black/40">
                  Od
                </span>
                <input
                  type="date"
                  value={customFrom}
                  onChange={(event) => setCustomFrom(event.target.value)}
                  className="w-full rounded-xl border border-black/[0.08] bg-[#FAFAFC] px-3 py-2 text-xs outline-none focus:border-brand/30 focus:ring-4 focus:ring-brand/10"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-[11px] font-semibold text-black/40">
                  Do
                </span>
                <input
                  type="date"
                  value={customTo}
                  onChange={(event) => setCustomTo(event.target.value)}
                  className="w-full rounded-xl border border-black/[0.08] bg-[#FAFAFC] px-3 py-2 text-xs outline-none focus:border-brand/30 focus:ring-4 focus:ring-brand/10"
                />
              </label>
            </div>
            {error ? (
              <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>
            ) : null}
            <button
              type="button"
              onClick={applyCustomRange}
              className="mt-3 w-full rounded-xl bg-brand px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#4D4EE8]"
            >
              Zastosuj zakres
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
