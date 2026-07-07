import { BookingItems } from '../../../entities/generated';

export function todayUtcDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function maxStayEndDate(items: BookingItems[]): string | null {
  let max: string | null = null;
  for (const item of items) {
    const date = item.endDate
      ? String(item.endDate).slice(0, 10)
      : item.startDate
        ? String(item.startDate).slice(0, 10)
        : null;
    if (!date) continue;
    if (!max || date > max) max = date;
  }
  return max;
}

export function isStayEnded(items: BookingItems[]): boolean {
  const maxEnd = maxStayEndDate(items);
  if (!maxEnd) return false;
  return maxEnd < todayUtcDate();
}
