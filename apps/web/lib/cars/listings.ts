import type { VehicleDetailQuery, VehicleSearchQuery } from './types';

export type CarsSearchParams = {
  departureLocation?: string;
  arrivalLocation?: string;
  travelDate?: string;
  routeId?: string;
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
  const departureLocation =
    readSearchParam(raw.departureLocation) ??
    readSearchParam(raw.pickupLocation) ??
    readSearchParam(raw.destination) ??
    readSearchParam(raw.from) ??
    readSearchParam(raw.to);
  const arrivalLocation =
    readSearchParam(raw.arrivalLocation) ?? readSearchParam(raw.dropOffLocation);
  const travelDate =
    readSearchParam(raw.travelDate) ??
    readSearchParam(raw.pickupDate) ??
    readSearchParam(raw.checkIn) ??
    readSearchParam(raw.departDate);
  const routeId = readSearchParam(raw.routeId);

  return {
    departureLocation: departureLocation?.trim() || undefined,
    arrivalLocation: arrivalLocation?.trim() || undefined,
    travelDate,
    routeId: routeId?.trim() || undefined,
  };
}

/** True when the user supplied a travel date (optionally with endpoints). */
export function hasRequiredCarDates(params: CarsSearchParams): boolean {
  return Boolean(params.travelDate?.trim());
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
  if (params.departureLocation) qs.set('departureLocation', params.departureLocation);
  if (params.arrivalLocation) qs.set('arrivalLocation', params.arrivalLocation);
  if (params.travelDate) qs.set('travelDate', params.travelDate);
  if (params.routeId) qs.set('routeId', params.routeId);
  const query = qs.toString();
  return query ? `?${query}` : '';
}

export function buildCarDetailHref(
  id: string,
  params: CarDetailSearchParams,
  hash?: string,
): string {
  const qs = new URLSearchParams();
  if (params.routeId) qs.set('routeId', params.routeId);
  if (params.departureLocation) qs.set('departureLocation', params.departureLocation);
  if (params.arrivalLocation) qs.set('arrivalLocation', params.arrivalLocation);
  if (params.travelDate) qs.set('travelDate', params.travelDate);
  const query = qs.toString();
  const base = `/cars/${encodeURIComponent(id)}${query ? `?${query}` : ''}`;
  return hash ? `${base}${hash}` : base;
}

export function toVehicleSearchQuery(params: CarsSearchParams): VehicleSearchQuery {
  const query: VehicleSearchQuery = { limit: 50 };

  if (params.departureLocation?.trim()) {
    query.departureLocation = params.departureLocation.trim();
  }
  if (params.arrivalLocation?.trim()) {
    query.arrivalLocation = params.arrivalLocation.trim();
  }
  if (params.travelDate) query.travelDate = params.travelDate;

  return query;
}

export function toVehicleDetailQuery(
  params: CarDetailSearchParams,
): VehicleDetailQuery | null {
  if (!params.travelDate) {
    return null;
  }

  const query: VehicleDetailQuery = {
    travelDate: params.travelDate,
  };
  if (params.routeId) query.routeId = params.routeId;

  return query;
}
