/** Date de départ par défaut pour tests seed (créneaux activités forfait Kinshasa). */
export const DEFAULT_PACKAGE_START_DATE = '2026-07-20';

function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function parsePackageDurationDays(
  pkg: { durationDays?: number | null } | undefined,
): number {
  const n = pkg?.durationDays;
  if (typeof n === 'number' && Number.isFinite(n) && n >= 1) {
    return Math.floor(n);
  }
  return 3;
}

/** Date de fin = départ + durationDays (modèle web / BookingEngine). */
export function computePackageEndDate(startDate: string, durationDays: number): string {
  return addDays(startDate, durationDays);
}

export function defaultPackageStartDate(): string {
  return DEFAULT_PACKAGE_START_DATE;
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
  if (!startDate || durationDays < 1 || travelers < 1) {
    return null;
  }
  const endDate = computePackageEndDate(startDate, durationDays);
  if (endDate <= startDate) {
    return null;
  }
  return { startDate, endDate, travelers };
}
