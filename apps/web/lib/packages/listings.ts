import type { PackagesBrowseQuery } from './types';

export type PackagesSearchParams = {
  search?: string;
  page?: string;
  date?: string;
  participants?: string;
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
