import type {
  GapPageSectionKey,
  PaginatedResponse,
  PublicGapActivity,
  PublicGapHome,
  PublicGapMediaItem,
  PublicGapMediaListQuery,
  PublicGapPage,
} from '@africatourismgate/types';
import { getPublicApiBaseUrl, getPublicApiOrigin } from './api-base-url';

async function fetchPublic<T>(path: string): Promise<T> {
  const apiUrl = getPublicApiBaseUrl();
  const res = await fetch(`${apiUrl}${path}`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${path}`);
  }
  return res.json() as Promise<T>;
}

function buildLocaleQuery(locale?: string): string {
  return locale ? `?locale=${encodeURIComponent(locale)}` : '';
}

function buildMediaQuery(query?: PublicGapMediaListQuery): string {
  if (!query) return '';
  const qs = new URLSearchParams();
  if (query.locale) qs.set('locale', query.locale);
  if (query.mediaType) qs.set('mediaType', query.mediaType);
  if (query.page !== undefined) qs.set('page', String(query.page));
  if (query.limit !== undefined) qs.set('limit', String(query.limit));
  const s = qs.toString();
  return s ? `?${s}` : '';
}

export async function getGapHome(locale?: string): Promise<PublicGapHome> {
  return fetchPublic<PublicGapHome>(`/public/gap${buildLocaleQuery(locale)}`);
}

export async function getGapHomeForLocale(locale?: string): Promise<PublicGapHome> {
  if (!locale) {
    return getGapHome();
  }
  try {
    return await getGapHome(locale);
  } catch {
    return getGapHome();
  }
}

export async function getGapPageBySectionKey(
  sectionKey: GapPageSectionKey,
  locale?: string,
): Promise<PublicGapPage> {
  return fetchPublic<PublicGapPage>(
    `/public/gap/pages/${encodeURIComponent(sectionKey)}${buildLocaleQuery(locale)}`,
  );
}

export async function getGapPageBySectionKeyForLocale(
  sectionKey: GapPageSectionKey,
  locale?: string,
): Promise<PublicGapPage> {
  if (!locale) {
    return getGapPageBySectionKey(sectionKey);
  }
  try {
    return await getGapPageBySectionKey(sectionKey, locale);
  } catch {
    return getGapPageBySectionKey(sectionKey);
  }
}

export async function listGapActivities(locale?: string): Promise<PublicGapActivity[]> {
  return fetchPublic<PublicGapActivity[]>(`/public/gap/activities${buildLocaleQuery(locale)}`);
}

export async function listGapActivitiesForLocale(locale?: string): Promise<PublicGapActivity[]> {
  if (!locale) {
    return listGapActivities();
  }
  try {
    return await listGapActivities(locale);
  } catch {
    return listGapActivities();
  }
}

export async function listGapMedia(
  query?: PublicGapMediaListQuery,
): Promise<PaginatedResponse<PublicGapMediaItem>> {
  return fetchPublic<PaginatedResponse<PublicGapMediaItem>>(
    `/public/gap/media${buildMediaQuery(query)}`,
  );
}

export async function listGapMediaForLocale(
  query?: PublicGapMediaListQuery,
): Promise<PaginatedResponse<PublicGapMediaItem>> {
  const locale = query?.locale;
  if (!locale) {
    return listGapMedia(query);
  }
  try {
    return await listGapMedia(query);
  } catch {
    return listGapMedia({ ...query, locale: undefined });
  }
}

export function resolveGapMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const origin = getPublicApiOrigin();
  if (url.startsWith('/api/')) return `${origin}${url}`;
  if (url.startsWith('/uploads/')) return `${origin}/api${url}`;
  return url;
}

export function resolveGapDonateUrl(
  settings: { donateUrl?: string | null } | null | undefined,
): string | null {
  const fromSettings = settings?.donateUrl?.trim();
  if (fromSettings) return fromSettings;
  const fromEnv = process.env.NEXT_PUBLIC_GAP_DONATE_URL?.trim();
  return fromEnv || null;
}
