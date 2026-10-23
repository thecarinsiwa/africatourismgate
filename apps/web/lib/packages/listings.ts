import type { PackagesBrowseQuery } from './types';

export type PackagesSearchParams = {
  search?: string;
  page?: string;
  startDate?: string;
  travelers?: string;
  sailingId?: string;
};

export function readSearchParam(
  value: string | string[] | undefined,
): string | undefined {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}

export function normalizePackagesSearchParams(
  raw: Record<string, string | string[] | undefined>,
): PackagesSearchParams {
  const travelers =
    readSearchParam(raw.travelers) ??
    readSearchParam(raw.guests) ??
    readSearchParam(raw.participants) ??
    readSearchParam(raw.adults);
  const startDate =
    readSearchParam(raw.startDate) ??
    readSearchParam(raw.checkIn) ??
    readSearchParam(raw.date) ??
    readSearchParam(raw.departureDate) ??
    readSearchParam(raw.pickupDate);

  return {
    search: readSearchParam(raw.search)?.trim() || undefined,
    page: readSearchParam(raw.page),
    startDate,
    travelers,
    sailingId: readSearchParam(raw.sailingId),
  };
}

export function parseParticipantsParam(participants?: string): number {
  const n = Number.parseInt(participants ?? '1', 10);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

export function formatPackagePrice(cents: number, currency: string): string {
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

export function buildPackagesSearchQuery(params: PackagesSearchParams): string {
  const qs = new URLSearchParams();
  if (params.search) qs.set('search', params.search);
  if (params.page) qs.set('page', params.page);
  if (params.startDate) qs.set('startDate', params.startDate);
  if (params.travelers) qs.set('travelers', params.travelers);
  if (params.sailingId) qs.set('sailingId', params.sailingId);
  const s = qs.toString();
  return s ? `?${s}` : '';
}

export function buildPackageDetailHref(
  packageId: string,
  params: PackagesSearchParams = {},
  hash?: string,
): string {
  const query = buildPackagesSearchQuery(params);
  const base = `/packages/${encodeURIComponent(packageId)}${query}`;
  return hash ? `${base}${hash}` : base;
}

export function toPackagesBrowseQuery(params: PackagesSearchParams): PackagesBrowseQuery {
  const page = Number.parseInt(params.page ?? '1', 10);
  return {
    search: params.search,
    page: Number.isFinite(page) && page >= 1 ? page : 1,
    limit: 50,
  };
}

export function hasPackageDiscount(pricing: {
  discountAmountCents: number;
}): boolean {
  return pricing.discountAmountCents > 0;
}
