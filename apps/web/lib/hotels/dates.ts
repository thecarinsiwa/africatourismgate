import type { Locale } from '../i18n/types';

export function formatDateISO(year: number, month: number, day: number): string {
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

export function parseYearMonth(isoMonth: string): { year: number; month: number } {
  const [y, m] = isoMonth.split('-').map(Number);
  return { year: y, month: m };
}

export function currentYearMonth(): string {
  const now = new Date();
  return formatDateISO(now.getFullYear(), now.getMonth() + 1, 1).slice(0, 7);
}

export function todayISODate(): string {
  const now = new Date();
  return formatDateISO(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export function shiftYearMonth(isoMonth: string, delta: number): string {
  const { year, month } = parseYearMonth(isoMonth);
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function enumerateMonthDays(isoMonth: string): string[] {
  const { year, month } = parseYearMonth(isoMonth);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return Array.from({ length: daysInMonth }, (_, i) =>
    formatDateISO(year, month, i + 1),
  );
}

const MONTH_NAMES_FR = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
] as const;

const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

const MONTH_NAMES_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
] as const;

export function formatMonthLabel(isoMonth: string, locale: Locale = 'fr'): string {
  const { year, month } = parseYearMonth(isoMonth);
  const names =
    locale === 'en'
      ? MONTH_NAMES_EN
      : locale === 'es'
        ? MONTH_NAMES_ES
        : MONTH_NAMES_FR;
  return `${names[month - 1]} ${year}`;
}

export function formatDisplayDate(iso: string, locale?: string): string {
  try {
    return new Date(`${iso}T12:00:00`).toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function isDateBefore(a: string, b: string): boolean {
  return a < b;
}

/** Nights for a stay: checkIn inclusive, checkOut exclusive (matches API). */
export function countStayNights(checkIn: string, checkOut: string): number {
  const [y1, m1, d1] = checkIn.split('-').map(Number);
  const [y2, m2, d2] = checkOut.split('-').map(Number);
  const start = Date.UTC(y1, m1 - 1, d1);
  const end = Date.UTC(y2, m2 - 1, d2);
  return Math.max(0, Math.round((end - start) / 86_400_000));
}

export function isStayNight(
  date: string,
  checkIn: string | null,
  checkOut: string | null,
): boolean {
  if (!checkIn) return false;
  if (!checkOut) return date === checkIn;
  return date >= checkIn && date < checkOut;
}

export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return date.toISOString().slice(0, 10);
}
