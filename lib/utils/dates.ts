const kathmanduTimeZone = "Asia/Kathmandu";

function parseDate(value: Date | string | number | null | undefined): Date | null {
  if (value == null) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(
  value: Date | string | number | null | undefined,
  locale = "en-NP",
): string {
  const date = parseDate(value);
  if (!date) return "—";
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeZone: kathmanduTimeZone,
  }).format(date);
}

export function formatTimestamp(
  value: Date | string | number | null | undefined,
  locale = "en-NP",
): string {
  const date = parseDate(value);
  if (!date) return "—";
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: kathmanduTimeZone,
  }).format(date);
}
