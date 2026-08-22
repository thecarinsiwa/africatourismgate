import type { BookingDetailPdfLocale } from './booking-detail-pdf.labels';

function intlTag(locale: BookingDetailPdfLocale): string {
  if (locale === 'en') return 'en-US';
  if (locale === 'es') return 'es-ES';
  return 'fr-FR';
}

export function toDateOnlyString(value: string | null | undefined): string | null {
  if (!value?.trim()) {
    return null;
  }
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(value.trim());
  return match ? match[1]! : value.slice(0, 10);
}

export function formatPdfDateTime(
  value: string | Date,
  locale: BookingDetailPdfLocale,
): string {
  const date = value instanceof Date ? value : new Date(value);
  try {
    return new Intl.DateTimeFormat(intlTag(locale), {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(date);
  } catch {
    return value instanceof Date ? value.toISOString() : value;
  }
}

export function formatVisitDate(
  value: string | null,
  locale: BookingDetailPdfLocale,
): string {
  const dateOnly = toDateOnlyString(value);
  if (!dateOnly) {
    return '—';
  }
  try {
    return new Intl.DateTimeFormat(intlTag(locale), { dateStyle: 'medium' }).format(
      new Date(`${dateOnly}T00:00:00Z`),
    );
  } catch {
    return dateOnly;
  }
}

export function formatItemDateRange(
  startDate: string | null,
  endDate: string | null,
  locale: BookingDetailPdfLocale,
): string {
  const start = toDateOnlyString(startDate);
  if (!start) {
    return '—';
  }
  const end = toDateOnlyString(endDate);
  if (!end || end === start) {
    return formatVisitDate(start, locale);
  }
  return `${formatVisitDate(start, locale)} → ${formatVisitDate(end, locale)}`;
}

export function formatPdfScheduleRange(
  start: string | Date,
  end: string | Date,
  locale: BookingDetailPdfLocale,
): string {
  const startDate = start instanceof Date ? start : new Date(start);
  const endDate = end instanceof Date ? end : new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return '—';
  }

  const sameDay = startDate.toISOString().slice(0, 10) === endDate.toISOString().slice(0, 10);
  const tag = intlTag(locale);
  const timeFmt: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
  const dateFmt: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };

  if (sameDay) {
    const day = new Intl.DateTimeFormat(tag, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(startDate);
    const from = new Intl.DateTimeFormat(tag, timeFmt).format(startDate);
    const to = new Intl.DateTimeFormat(tag, timeFmt).format(endDate);
    return `${day} · ${from} – ${to}`;
  }

  return `${new Intl.DateTimeFormat(tag, dateFmt).format(startDate)} → ${new Intl.DateTimeFormat(tag, dateFmt).format(endDate)}`;
}
