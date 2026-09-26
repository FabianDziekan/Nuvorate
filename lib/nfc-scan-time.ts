const NFC_TIME_ZONE = "Europe/Warsaw";

const calendarDateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: NFC_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const scanTimeFormatter = new Intl.DateTimeFormat("pl-PL", {
  timeZone: NFC_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
});

const scanDateTimeFormatter = new Intl.DateTimeFormat("pl-PL", {
  timeZone: NFC_TIME_ZONE,
  dateStyle: "medium",
  timeStyle: "short",
});

function calendarDayNumber(date: Date) {
  const parts = calendarDateFormatter.formatToParts(date);
  const value = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  return Date.UTC(value("year"), value("month") - 1, value("day")) / 86_400_000;
}

export function formatNfcScanTime(scannedAt?: string | null, now = new Date()) {
  if (!scannedAt) return "Brak skanów";
  const scanDate = new Date(scannedAt);
  if (Number.isNaN(scanDate.getTime())) return "Brak skanów";

  const time = scanTimeFormatter.format(scanDate);
  const dayDifference = calendarDayNumber(now) - calendarDayNumber(scanDate);
  if (dayDifference === 0) return `Dzisiaj, ${time}`;
  if (dayDifference === 1) return `Wczoraj, ${time}`;
  return scanDateTimeFormatter.format(scanDate);
}
