import type { VehicleDetailQuery, VehicleSearchQuery } from './types';

export type CarsSearchParams = {
  pickupLocation?: string;
  pickupDate?: string;
  returnDate?: string;
};

export type CarDetailSearchParams = CarsSearchParams;

export function readSearchParam(
  value: string | string[] | undefined,
): string | undefined {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}

/** Maps canonical and legacy home-search query params to car search params. */
export function normalizeCarsSearchParams(
  raw: Record<string, string | string[] | undefined>,
): CarsSearchParams {
  const pickupLocation =
    readSearchParam(raw.pickupLocation) ??
    readSearchParam(raw.destination) ??
    readSearchParam(raw.to);
  const pickupDate =
    readSearchParam(raw.pickupDate) ??
    readSearchParam(raw.checkIn) ??
    readSearchParam(raw.departDate);
  const returnDate =
    readSearchParam(raw.returnDate) ?? readSearchParam(raw.checkOut);

  return {
    pickupLocation: pickupLocation?.trim() || undefined,
    pickupDate,
    returnDate,
  };
}

export function hasRequiredCarDates(params: CarsSearchParams): boolean {
  return Boolean(
    params.pickupLocation?.trim() &&
      params.pickupDate &&
      params.returnDate &&
      params.returnDate > params.pickupDate,
  );
}

/** Calendar rental days: pickup inclusive, return exclusive (matches API). */
export function countRentalDays(pickupDate: string, returnDate: string): number {
  const pickup = parseDateOnly(pickupDate);
  const returnDay = parseDateOnly(returnDate);
  if (!pickup || !returnDay || returnDay <= pickup) return 0;
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((returnDay.getTime() - pickup.getTime()) / msPerDay);
}

export function computeVehicleTotal(
  dailyPriceCents: number,
  rentalDays: number,
): number {
  return dailyPriceCents * rentalDays;
}

export function formatCarPrice(cents: number, currency: string): string {
  const amount = cents / 100;
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(0)}`;
  }
}

export function buildCarsSearchQuery(params: CarsSearchParams): string {
  const qs = new URLSearchParams();
  if (params.pickupLocation) qs.set('pickupLocation', params.pickupLocation);
  if (params.pickupDate) qs.set('pickupDate', params.pickupDate);
  if (params.returnDate) qs.set('returnDate', params.returnDate);
  const query = qs.toString();
  return query ? `?${query}` : '';
}

export function buildCarDetailHref(
  id: string,
  params: CarDetailSearchParams,
  hash?: string,
): string {
  const qs = new URLSearchParams();
  if (params.pickupLocation) qs.set('pickupLocation', params.pickupLocation);
  if (params.pickupDate) qs.set('pickupDate', params.pickupDate);
  if (params.returnDate) qs.set('returnDate', params.returnDate);
  const query = qs.toString();
  const base = `/cars/${encodeURIComponent(id)}${query ? `?${query}` : ''}`;
  return hash ? `${base}${hash}` : base;
}

export function toVehicleSearchQuery(
  params: CarsSearchParams,
): VehicleSearchQuery | null {
  if (!hasRequiredCarDates(params)) return null;

  return {
    pickupLocation: params.pickupLocation!.trim(),
    pickupDate: params.pickupDate!,
    returnDate: params.returnDate!,
    limit: 50,
  };
}

export function toVehicleDetailQuery(
  params: CarDetailSearchParams,
): VehicleDetailQuery | null {
  if (!params.pickupDate || !params.returnDate || params.returnDate <= params.pickupDate) {
    return null;
  }

  return {
    pickupDate: params.pickupDate,
    returnDate: params.returnDate,
  };
}

function parseDateOnly(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return new Date(Date.UTC(year, month - 1, day));
}
