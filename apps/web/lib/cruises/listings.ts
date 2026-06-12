import type { CruiseSearchQuery, CruiseSailingDetailQuery } from './types';

export type CruisesSearchParams = {
  sailFrom?: string;
  sailTo?: string;
  startDate?: string;
  endDate?: string;
  guests?: string;
};

export type CruiseDetailSearchParams = CruisesSearchParams & {
  cabinId?: string;
};

export function readSearchParam(
  value: string | string[] | undefined,
): string | undefined {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}

function normalizePortCode(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  return trimmed.toUpperCase();
}

/** Maps canonical and legacy home-search query params to cruise search params. */
export function normalizeCruisesSearchParams(
  raw: Record<string, string | string[] | undefined>,
): CruisesSearchParams {
  const startDate =
    readSearchParam(raw.startDate) ??
    readSearchParam(raw.checkIn) ??
    readSearchParam(raw.departDate);
  const endDate =
    readSearchParam(raw.endDate) ??
    readSearchParam(raw.checkOut) ??
    readSearchParam(raw.returnDate);
  const guests =
    readSearchParam(raw.guests) ?? readSearchParam(raw.adults);

  return {
    sailFrom: normalizePortCode(
      readSearchParam(raw.sailFrom) ?? readSearchParam(raw.from),
    ),
    sailTo: normalizePortCode(readSearchParam(raw.sailTo) ?? readSearchParam(raw.to)),
    startDate,
    endDate,
    guests,
  };
}

export function parseGuestsParam(guests?: string): number {
  const n = Number.parseInt(guests ?? '1', 10);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

export function hasRequiredCruiseSearchParams(params: CruisesSearchParams): boolean {
  return Boolean(
    params.sailFrom?.trim() &&
      params.sailTo?.trim() &&
      params.startDate &&
      params.endDate &&
      params.endDate > params.startDate,
  );
}

export function formatCruisePrice(cents: number, currency: string): string {
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

export function formatPortTime(value: string | null, locale?: string): string | null {
  if (!value) return null;
  const match = /^(\d{2}):(\d{2})/.exec(value);
  if (!match) return value;
  const date = new Date(Date.UTC(1970, 0, 1, Number(match[1]), Number(match[2])));
  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  });
}

export function buildCruisesSearchQuery(params: CruisesSearchParams): string {
  const qs = new URLSearchParams();
  if (params.sailFrom) qs.set('sailFrom', params.sailFrom);
  if (params.sailTo) qs.set('sailTo', params.sailTo);
  if (params.startDate) qs.set('startDate', params.startDate);
  if (params.endDate) qs.set('endDate', params.endDate);
  if (params.guests) qs.set('guests', params.guests);
  const query = qs.toString();
  return query ? `?${query}` : '';
}

export function buildCruiseDetailHref(
  sailingId: string,
  params: CruiseDetailSearchParams,
  hash?: string,
): string {
  const qs = new URLSearchParams();
  if (params.sailFrom) qs.set('sailFrom', params.sailFrom);
  if (params.sailTo) qs.set('sailTo', params.sailTo);
  if (params.startDate) qs.set('startDate', params.startDate);
  if (params.endDate) qs.set('endDate', params.endDate);
  if (params.guests) qs.set('guests', params.guests);
  if (params.cabinId) qs.set('cabinId', params.cabinId);
  const query = qs.toString();
  const base = `/cruises/${encodeURIComponent(sailingId)}${query ? `?${query}` : ''}`;
  return hash ? `${base}${hash}` : base;
}

export function toCruiseSearchQuery(params: CruisesSearchParams): CruiseSearchQuery | null {
  if (!hasRequiredCruiseSearchParams(params)) return null;

  return {
    sailFrom: params.sailFrom!.trim().toUpperCase(),
    sailTo: params.sailTo!.trim().toUpperCase(),
    startDate: params.startDate!,
    endDate: params.endDate!,
    guests: parseGuestsParam(params.guests),
    limit: 50,
  };
}

export function toCruiseSailingDetailQuery(
  params: CruiseDetailSearchParams,
): CruiseSailingDetailQuery {
  return {
    guests: parseGuestsParam(params.guests),
  };
}
