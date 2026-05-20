const MONTH_NAMES = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
] as const;

const WEEKDAY_NAMES = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'] as const;

export function formatDateISO(year: number, month: number, day: number): string {
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

export function parseYearMonth(isoMonth: string): { year: number; month: number } {
  const [y, m] = isoMonth.split('-').map(Number);
  return { year: y, month: m };
}

/** `YYYY-MM` */
export function currentYearMonth(): string {
  const now = new Date();
  return formatDateISO(now.getFullYear(), now.getMonth() + 1, 1).slice(0, 7);
}

export function shiftYearMonth(isoMonth: string, delta: number): string {
  const { year, month } = parseYearMonth(isoMonth);
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function startOfMonth(isoMonth: string): string {
  const { year, month } = parseYearMonth(isoMonth);
  return formatDateISO(year, month, 1);
}

export function endOfMonth(isoMonth: string): string {
  const { year, month } = parseYearMonth(isoMonth);
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return formatDateISO(year, month, lastDay);
}

export function daysInMonth(isoMonth: string): number {
  const { year, month } = parseYearMonth(isoMonth);
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function enumerateMonthDays(isoMonth: string): string[] {
  const count = daysInMonth(isoMonth);
  const { year, month } = parseYearMonth(isoMonth);
  return Array.from({ length: count }, (_, i) => formatDateISO(year, month, i + 1));
}

export function formatMonthLabel(isoMonth: string): string {
  const { year, month } = parseYearMonth(isoMonth);
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

export function formatDateLabel(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const weekday = WEEKDAY_NAMES[date.getUTCDay()];
  return `${weekday} ${d} ${MONTH_NAMES[m - 1]} ${y}`;
}

export function formatPrice(cents: number, currency: string): string {
  return `${(cents / 100).toFixed(2)} ${currency}`;
}
