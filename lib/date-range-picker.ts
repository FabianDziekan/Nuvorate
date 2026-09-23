export type DateRangeQueryKeys = {
  rangeParam: string;
  fromParam: string;
  toParam: string;
  customValue?: string;
};

export function presetDateRangeParams(
  current: string,
  keys: DateRangeQueryKeys,
  preset: "30d" | "3m" | "12m",
) {
  const params = new URLSearchParams(current);
  params.set(keys.rangeParam, preset);
  params.delete(keys.fromParam);
  params.delete(keys.toParam);
  return params;
}

export function customDateRangeParams(
  current: string,
  keys: DateRangeQueryKeys,
  from: string,
  to: string,
) {
  const params = new URLSearchParams(current);
  if (keys.customValue) params.set(keys.rangeParam, keys.customValue);
  else params.delete(keys.rangeParam);
  params.set(keys.fromParam, from);
  params.set(keys.toParam, to);
  return params;
}

export function parseDateRangeDisplayDay(value: string | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00`);
  if (!Number.isFinite(date.getTime())) return null;
  const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  return key === value ? date : null;
}

export function formatDateRangeDisplayDay(date: Date) {
  return date.toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function analysisPickerSelection({
  range,
  from,
  to,
}: {
  range?: string;
  from?: string;
  to?: string;
}) {
  const fromDate = parseDateRangeDisplayDay(from);
  const toDate = parseDateRangeDisplayDay(to);
  if (range === "custom" && fromDate && toDate && fromDate <= toDate) {
    return {
      preset: "custom" as const,
      from,
      to,
      label: `${formatDateRangeDisplayDay(fromDate)} – ${formatDateRangeDisplayDay(toDate)}`,
    };
  }
  const preset: "30d" | "3m" | "12m" = range === "3m" || range === "12m" ? range : "30d";
  return {
    preset,
    from: undefined,
    to: undefined,
    label: preset === "30d" ? "Ostatnie 30 dni" : preset === "3m" ? "Ostatnie 3 miesiące" : "Ostatnie 12 miesięcy",
  };
}
