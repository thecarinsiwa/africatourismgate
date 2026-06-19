const ABSOLUTE_THRESHOLD_DAYS = 30;

function absoluteReviewDate(date: Date, localeTag: string): string {
  return date.toLocaleDateString(localeTag, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** Date relative récente (Intl) ; au-delà du seuil, date absolue longue. */
export function formatRelativeReviewDate(
  iso: string,
  localeTag: string,
  now: Date = new Date(),
): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const diffMs = date.getTime() - now.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);

  if (Math.abs(diffDay) > ABSOLUTE_THRESHOLD_DAYS) {
    return absoluteReviewDate(date, localeTag);
  }

  const rtf = new Intl.RelativeTimeFormat(localeTag, { numeric: 'auto' });
  const diffWeek = Math.round(diffDay / 7);
  const diffMonth = Math.round(diffDay / 30);
  const diffYear = Math.round(diffDay / 365);

  if (Math.abs(diffYear) >= 1) return rtf.format(diffYear, 'year');
  if (Math.abs(diffMonth) >= 1) return rtf.format(diffMonth, 'month');
  if (Math.abs(diffWeek) >= 1) return rtf.format(diffWeek, 'week');
  if (Math.abs(diffDay) >= 1) return rtf.format(diffDay, 'day');
  if (Math.abs(diffHour) >= 1) return rtf.format(diffHour, 'hour');
  if (Math.abs(diffMin) >= 1) return rtf.format(diffMin, 'minute');
  return rtf.format(diffSec, 'second');
}
