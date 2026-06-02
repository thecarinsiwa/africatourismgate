import { BookingItems } from '../../../entities/generated';

export function todayUtcDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function maxStayEndDate(items: BookingItems[]): string | null {
  let max: string | null = null;
  for (const item of items) {
    if (!item.endDate) continue;
    const date = String(item.endDate).slice(0, 10);
    if (!max || date > max) max = date;
  }
  return max;
}

export function isStayEnded(items: BookingItems[]): boolean {
  const maxEnd = maxStayEndDate(items);
  if (!maxEnd) return false;
  return maxEnd < todayUtcDate();
}
