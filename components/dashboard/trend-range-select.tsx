"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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

const weekdayLabels = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"];
const monthFormatter = new Intl.DateTimeFormat("pl-PL", {
  month: "long",
  year: "numeric",
});

function formatInputDate(value?: string) {
  return typeof value === "string" ? value : "";
}

function formatCalendarDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseCalendarDate(value: string) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00`);

  if (!Number.isFinite(date.getTime()) || formatCalendarDate(date) !== value) {
    return null;
  }

  return date;
}

function getCalendarStart(month: Date) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const day = firstDay.getDay() === 0 ? 7 : firstDay.getDay();
  const calendarStart = new Date(firstDay);
  calendarStart.setDate(firstDay.getDate() - day + 1);

  return calendarStart;
}

function getMonthLabel(month: Date) {
  const label = monthFormatter.format(month);

  return label.charAt(0).toUpperCase() + label.slice(1);
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      {direction === "left" ? (
        <path d="m15 18-6-6 6-6" />
      ) : (
        <path d="m9 18 6-6-6-6" />
      )}
    </svg>
  );
}

function CalendarDateField({
  align = "left",
  isCalendarOpen,
  label,
  onChange,
  onOpenChange,
  value,
}: {
  align?: "left" | "right";
  isCalendarOpen: boolean;
  label: string;
  onChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
  value: string;
}) {
  const selectedDate = parseCalendarDate(value);
  const [visibleMonth, setVisibleMonth] = useState(
    selectedDate ?? new Date(),
  );
  const today = new Date();
  const todayKey = formatCalendarDate(today);
  const selectedKey = selectedDate ? formatCalendarDate(selectedDate) : "";
  const monthStart = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth(),
    1,
  );
  const calendarStart = getCalendarStart(monthStart);
  const days = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(calendarStart);
    date.setDate(calendarStart.getDate() + index);

    return date;
  });

  useEffect(() => {
    const nextSelectedDate = parseCalendarDate(value);

    if (nextSelectedDate) {
      setVisibleMonth(nextSelectedDate);
    }
  }, [value]);

  function moveMonth(direction: -1 | 1) {
    setVisibleMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + direction, 1),
    );
  }

  function selectDate(date: Date) {
    onChange(formatCalendarDate(date));
    onOpenChange(false);
  }

  return (
    <div className="relative space-y-1.5">
      <span className="text-[11px] font-semibold text-black/40">{label}</span>
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => onOpenChange(true)}
          onClick={() => onOpenChange(true)}
          placeholder="YYYY-MM-DD"
          className="date-range-trigger w-full rounded-xl border border-black/[0.08] bg-[#FAFAFC] px-3 py-2 pr-9 text-left text-xs font-medium text-ink outline-none transition duration-150 hover:border-brand/25 focus:border-brand/40 focus:ring-4 focus:ring-brand/10"
          aria-expanded={isCalendarOpen}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-black/35">
          <svg
            aria-hidden="true"
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          >
            <path d="M8 2v4" />
            <path d="M16 2v4" />
            <path d="M3 10h18" />
            <rect width="18" height="18" x="3" y="4" rx="2" />
          </svg>
        </span>
      </div>

      {isCalendarOpen ? (
        <div
          className={`date-range-calendar absolute top-[calc(100%+8px)] z-[70] w-[286px] rounded-2xl border border-black/[0.08] bg-white p-4 shadow-[0_22px_70px_rgba(15,15,16,0.16)] ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => moveMonth(-1)}
              className="date-range-calendar-nav grid h-8 w-8 place-items-center rounded-lg text-black/50 outline-none transition duration-150 hover:bg-brand-soft hover:text-brand focus:ring-4 focus:ring-brand/10"
              aria-label="Poprzedni miesiąc"
            >
              <ChevronIcon direction="left" />
            </button>
            <p className="text-center text-sm font-semibold text-ink">
              {getMonthLabel(monthStart)}
            </p>
            <button
              type="button"
              onClick={() => moveMonth(1)}
              className="date-range-calendar-nav grid h-8 w-8 place-items-center rounded-lg text-black/50 outline-none transition duration-150 hover:bg-brand-soft hover:text-brand focus:ring-4 focus:ring-brand/10"
              aria-label="Następny miesiąc"
            >
              <ChevronIcon direction="right" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {weekdayLabels.map((day) => (
              <div
                key={day}
                className="grid h-8 place-items-center text-xs font-medium text-black/40"
              >
                {day}
              </div>
            ))}

            {days.map((date) => {
              const dateKey = formatCalendarDate(date);
              const isSelected = dateKey === selectedKey;
              const isToday = dateKey === todayKey;
              const isOutsideMonth = date.getMonth() !== monthStart.getMonth();

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => selectDate(date)}
                  className={`date-range-calendar-day grid h-9 w-9 place-items-center rounded-full text-sm font-medium outline-none transition duration-150 focus:ring-4 focus:ring-brand/10 ${
                    isSelected
                      ? "bg-brand text-white"
                      : "text-ink hover:bg-brand-soft hover:text-brand"
                  } ${isToday && !isSelected ? "ring-1 ring-brand/35" : ""} ${
                    isOutsideMonth && !isSelected ? "opacity-35" : ""
                  }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
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
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [openCalendar, setOpenCalendar] = useState<"from" | "to" | null>(null);
  const [customFrom, setCustomFrom] = useState(formatInputDate(from));
  const [customTo, setCustomTo] = useState(formatInputDate(to));
  const [error, setError] = useState("");

  useEffect(() => {
    setCustomFrom(formatInputDate(from));
    setCustomTo(formatInputDate(to));
  }, [from, to]);

  function closeDropdown({ restoreFocus = true } = {}) {
    setOpenCalendar(null);
    setIsOpen(false);

    if (restoreFocus) {
      window.setTimeout(() => {
        triggerRef.current?.focus();
      }, 0);
    }
  }

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;

      if (
        target instanceof Node &&
        wrapperRef.current?.contains(target)
      ) {
        return;
      }

      closeDropdown();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();

      if (openCalendar) {
        setOpenCalendar(null);
        return;
      }

      closeDropdown();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, openCalendar]);

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
    setOpenCalendar(null);
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
    setOpenCalendar(null);
    setIsOpen(false);
    pushParams(params);
  }

  return (
    <div ref={wrapperRef} className="relative hidden sm:block">
      <button
        ref={triggerRef}
        type="button"
        onClick={() =>
          setIsOpen((current) => {
            const nextOpen = !current;

            if (!nextOpen) {
              setOpenCalendar(null);
            }

            return nextOpen;
          })
        }
        aria-expanded={isOpen}
        aria-haspopup="dialog"
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
              <CalendarDateField
                isCalendarOpen={openCalendar === "from"}
                label="Od"
                value={customFrom}
                onChange={setCustomFrom}
                onOpenChange={(open) =>
                  setOpenCalendar(open ? "from" : null)
                }
              />
              <CalendarDateField
                align="right"
                isCalendarOpen={openCalendar === "to"}
                label="Do"
                value={customTo}
                onChange={setCustomTo}
                onOpenChange={(open) => setOpenCalendar(open ? "to" : null)}
              />
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
