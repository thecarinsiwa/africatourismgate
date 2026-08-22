import type { BookingItem } from '@africatourismgate/types';

export type BookingVisitWindow = {
  startDate: string;
  endDate: string;
  minDatetimeLocal: string;
  maxDatetimeLocal: string;
};

function toDateOnly(value: string): string {
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(value.trim());
  return match ? match[1]! : value.slice(0, 10);
}

export function deriveBookingVisitWindow(items: BookingItem[]): BookingVisitWindow | null {
  const dated = items.filter((item) => item.startDate);
  if (dated.length === 0) {
    return null;
  }

  const starts = dated.map((item) => toDateOnly(item.startDate!)).sort();
  const ends = dated.map((item) => toDateOnly(item.endDate ?? item.startDate!)).sort();

  const startDate = starts[0]!;
  const endDate = ends[ends.length - 1]!;

  return {
    startDate,
    endDate,
    minDatetimeLocal: `${startDate}T00:00`,
    maxDatetimeLocal: `${endDate}T23:59`,
  };
}

export function clampDatetimeLocal(value: string, min: string, max: string): string {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

export function isDatetimeLocalWithinWindow(
  value: string,
  window: BookingVisitWindow,
): boolean {
  return value >= window.minDatetimeLocal && value <= window.maxDatetimeLocal;
}
