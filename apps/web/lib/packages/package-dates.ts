import { addDays } from '../hotels/dates';

export function parsePackageDurationDays(
  pkg: { durationDays?: number | null } | undefined,
): number {
  const n = pkg?.durationDays;
  if (typeof n === 'number' && Number.isFinite(n) && n >= 1) {
    return Math.floor(n);
  }
  return 3;
}

/** Return date is start + durationDays (exclusive end for stays and rentals). */
export function computePackageEndDate(startDate: string, durationDays: number): string {
  return addDays(startDate, durationDays);
}

export type PackageTravelDates = {
  startDate: string;
  endDate: string;
  travelers: number;
};

export function buildPackageTravelDates(
  startDate: string,
  durationDays: number,
  travelers: number,
): PackageTravelDates | null {
  if (!startDate || durationDays < 1 || travelers < 1) return null;
  const endDate = computePackageEndDate(startDate, durationDays);
  if (endDate <= startDate) return null;
  return { startDate, endDate, travelers };
}
