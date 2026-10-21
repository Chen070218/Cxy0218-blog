// Shared English date formatting for the site.
// Content dates are stored as "2026-10-16 14:00:00" (local time, no timezone),
// so they are parsed by hand instead of through Date, which would shift them.

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Format a stored date as English text.
 * @param value   e.g. "2026-10-16 14:00:00" or "2026-10-16"
 * @param withTime include ", 14:00" when a time other than 00:00 is present
 */
export function formatDate(value: string | undefined | null, withTime = false): string {
  if (!value) return '';
  const match = String(value).match(/(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2}))?/);
  if (!match) return String(value);

  const [, year, month, day, hours, minutes] = match;
  const base = `${MONTHS[Number(month) - 1]} ${Number(day)}, ${year}`;
  if (!withTime || hours === undefined) return base;
  if (hours === '00' && minutes === '00') return base;
  return `${base}, ${hours.padStart(2, '0')}:${minutes}`;
}

/** Month name for a Date, used by calendar-style views. */
export function monthName(date: Date): string {
  return ['January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'][date.getMonth()];
}

/** Short day + month, e.g. "Oct 21", for week ranges. */
export function formatDayMonth(date: Date): string {
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
}
