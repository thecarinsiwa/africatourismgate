import { resolveAirportCode } from './airports';
import type { FlightSearchQuery, PublicAirport } from './types';

let cachedAirports: PublicAirport[] = [];

export function setAirportsCatalog(airports: PublicAirport[]): void {
  cachedAirports = airports;
}

function normalizeAirportParam(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return resolveAirportCode(value, cachedAirports) ?? value.trim().toUpperCase();
}

export type FlightsSearchParams = {
  from?: string;
  to?: string;
  departureDate?: string;
  returnDate?: string;
  passengers?: string;
};

export type FlightDetailSearchParams = FlightsSearchParams & {
  classId?: string;
};

export function readSearchParam(
  value: string | string[] | undefined,
): string | undefined {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}

/** Maps canonical and legacy home-search query params to flight search params. */
export function normalizeFlightsSearchParams(
  raw: Record<string, string | string[] | undefined>,
): FlightsSearchParams {
  const departureDate =
    readSearchParam(raw.departureDate) ??
    readSearchParam(raw.checkIn) ??
    readSearchParam(raw.departDate);
  const returnDate =
    readSearchParam(raw.returnDate) ??
    readSearchParam(raw.checkOut);
  const passengers =
    readSearchParam(raw.passengers) ??
    readSearchParam(raw.guests) ??
    readSearchParam(raw.adults);

  return {
    from: normalizeAirportParam(readSearchParam(raw.from)),
    to: normalizeAirportParam(readSearchParam(raw.to)),
    departureDate,
    returnDate,
    passengers,
  };
}

export function parsePassengersParam(passengers?: string): number {
  const n = Number.parseInt(passengers ?? '1', 10);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

export function formatFlightPrice(cents: number, currency: string): string {
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

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours <= 0) return `${mins}min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}

export function formatFlightTime(iso: string, locale?: string): string {
  return new Date(iso).toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function buildFlightsSearchQuery(params: FlightsSearchParams): string {
  const qs = new URLSearchParams();
  if (params.from) qs.set('from', params.from);
  if (params.to) qs.set('to', params.to);
  if (params.departureDate) qs.set('departureDate', params.departureDate);
  if (params.returnDate) qs.set('returnDate', params.returnDate);
  if (params.passengers) qs.set('passengers', params.passengers);
  const query = qs.toString();
  return query ? `?${query}` : '';
}

export function buildFlightDetailHref(
  id: string,
  params: FlightDetailSearchParams,
  hash?: string,
): string {
  const qs = new URLSearchParams();
  if (params.from) qs.set('from', params.from);
  if (params.to) qs.set('to', params.to);
  if (params.departureDate) qs.set('departureDate', params.departureDate);
  if (params.returnDate) qs.set('returnDate', params.returnDate);
  if (params.passengers) qs.set('passengers', params.passengers);
  if (params.classId) qs.set('classId', params.classId);
  const query = qs.toString();
  const base = `/flights/${encodeURIComponent(id)}${query ? `?${query}` : ''}`;
  return hash ? `${base}${hash}` : base;
}

export function toFlightSearchQuery(params: FlightsSearchParams): FlightSearchQuery {
  const query: FlightSearchQuery = {
    passengers: parsePassengersParam(params.passengers),
    limit: 50,
  };

  if (params.from) query.from = params.from;
  if (params.to) query.to = params.to;
  if (params.departureDate) query.departureDate = params.departureDate;
  if (params.returnDate) query.returnDate = params.returnDate;

  return query;
}

export function toFlightDetailQuery(
  params: FlightDetailSearchParams,
): { departureDate: string; returnDate?: string; passengers: number } | null {
  if (!params.departureDate) return null;
  return {
    departureDate: params.departureDate,
    returnDate: params.returnDate,
    passengers: parsePassengersParam(params.passengers),
  };
}
