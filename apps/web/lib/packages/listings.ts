import type { PackagesBrowseQuery } from './types';
import {
  appendPackageLineToParams,
  parsePackageLineAtIndex,
  type PackageLineSelection,
} from './package-lines';

export type PackagesSearchParams = {
  search?: string;
  page?: string;
  date?: string;
  participants?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: string;
  departureDate?: string;
  passengers?: string;
  pickupDate?: string;
  returnDate?: string;
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
  return {
    search: readSearchParam(raw.search)?.trim() || undefined,
    page: readSearchParam(raw.page),
    date: readSearchParam(raw.date) ?? readSearchParam(raw.checkIn),
    participants:
      readSearchParam(raw.participants) ??
      readSearchParam(raw.guests) ??
      readSearchParam(raw.adults),
    checkIn: readSearchParam(raw.checkIn),
    checkOut: readSearchParam(raw.checkOut),
    guests: readSearchParam(raw.guests),
    departureDate: readSearchParam(raw.departureDate),
    passengers: readSearchParam(raw.passengers),
    pickupDate: readSearchParam(raw.pickupDate),
    returnDate: readSearchParam(raw.returnDate),
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
  if (params.date) qs.set('date', params.date);
  if (params.participants) qs.set('participants', params.participants);
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

export function parsePackageLineSelections(
  raw: Record<string, string | string[] | undefined>,
  itemCount: number,
): Array<PackageLineSelection | null> {
  const lineCountRaw = readSearchParam(raw.lineCount);
  const lineCount = lineCountRaw ? Number.parseInt(lineCountRaw, 10) : itemCount;
  if (!Number.isFinite(lineCount) || lineCount < 1) {
    return Array.from({ length: itemCount }, () => null);
  }

  const fallbackDate = readSearchParam(raw.date);
  const fallbackParticipants = readSearchParam(raw.participants);
  const fallback = {
    date: fallbackDate,
    participants: fallbackParticipants
      ? Number.parseInt(fallbackParticipants, 10)
      : undefined,
  };

  return Array.from({ length: itemCount }, (_, index) => {
    if (index >= lineCount) return null;
    return parsePackageLineAtIndex(raw, index, fallback);
  });
}

/** @deprecated Use parsePackageLineSelections */
export function parsePackageScheduleSelections(
  raw: Record<string, string | string[] | undefined>,
): Record<string, string> {
  const lineCountRaw = readSearchParam(raw.lineCount);
  const lineCount = lineCountRaw ? Number.parseInt(lineCountRaw, 10) : 0;
  if (!Number.isFinite(lineCount) || lineCount < 1) {
    return {};
  }

  const selections: Record<string, string> = {};
  for (let index = 0; index < lineCount; index += 1) {
    const activityId = readSearchParam(raw[`line${index}_activityId`]);
    const scheduleId = readSearchParam(raw[`line${index}_scheduleId`]);
    if (activityId && scheduleId) {
      selections[activityId] = scheduleId;
    }
  }
  return selections;
}

export function buildPackageDetailHrefWithLines(
  packageId: string,
  params: PackagesSearchParams,
  lines: Array<PackageLineSelection | null | undefined>,
  hash?: string,
): string {
  const qs = new URLSearchParams();
  if (params.search) qs.set('search', params.search);
  if (params.page) qs.set('page', params.page);
  if (params.date) qs.set('date', params.date);
  if (params.participants) qs.set('participants', params.participants);
  if (params.checkIn) qs.set('checkIn', params.checkIn);
  if (params.checkOut) qs.set('checkOut', params.checkOut);
  if (params.guests) qs.set('guests', params.guests);
  if (params.departureDate) qs.set('departureDate', params.departureDate);
  if (params.passengers) qs.set('passengers', params.passengers);
  if (params.pickupDate) qs.set('pickupDate', params.pickupDate);
  if (params.returnDate) qs.set('returnDate', params.returnDate);
  if (params.sailingId) qs.set('sailingId', params.sailingId);

  const configuredLines = lines.filter((line): line is PackageLineSelection => Boolean(line));
  if (lines.length > 0) {
    qs.set('lineCount', String(lines.length));
    lines.forEach((line, index) => {
      if (line) appendPackageLineToParams(qs, index, line);
    });
  } else if (configuredLines.length > 0) {
    qs.set('lineCount', String(configuredLines.length));
  }

  const query = qs.toString();
  const base = `/packages/${encodeURIComponent(packageId)}${query ? `?${query}` : ''}`;
  return hash ? `${base}${hash}` : base;
}

/** @deprecated Use buildPackageDetailHrefWithLines */
export function buildPackageDetailHrefWithSelections(
  packageId: string,
  params: PackagesSearchParams,
  activityIds: string[],
  selections: Record<string, string | undefined>,
  hash?: string,
): string {
  const qs = new URLSearchParams();
  if (params.search) qs.set('search', params.search);
  if (params.page) qs.set('page', params.page);
  if (params.date) qs.set('date', params.date);
  if (params.participants) qs.set('participants', params.participants);

  if (activityIds.length > 0) {
    qs.set('lineCount', String(activityIds.length));
    activityIds.forEach((activityId, index) => {
      qs.set(`line${index}_activityId`, activityId);
      const scheduleId = selections[activityId];
      if (scheduleId) {
        qs.set(`line${index}_scheduleId`, scheduleId);
      }
    });
  }

  const query = qs.toString();
  const base = `/packages/${encodeURIComponent(packageId)}${query ? `?${query}` : ''}`;
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

export function isActivityOnlyPackage(
  items: { itemType: string }[],
): boolean {
  return items.length > 0 && items.every((item) => item.itemType === 'activity');
}

export function hasPackageDiscount(pricing: {
  discountAmountCents: number;
}): boolean {
  return pricing.discountAmountCents > 0;
}
