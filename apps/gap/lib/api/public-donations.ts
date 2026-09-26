import type {
  DonationSurface,
  PublicDonation,
  PublicDonationsPayload,
} from '@africatourismgate/types';
import { notifyApiUnreachable } from '@africatourismgate/ui';
import { getPublicApiBaseUrl } from './api-base-url';

async function fetchPublic<T>(path: string): Promise<T> {
  const apiUrl = getPublicApiBaseUrl();
  let res: Response;
  try {
    res = await fetch(`${apiUrl}${path}`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
  } catch (cause) {
    if (typeof window !== 'undefined') {
      notifyApiUnreachable();
    }
    const detail = cause instanceof Error ? cause.message : 'network error';
    throw new Error(`API unreachable: ${path} (${detail})`, { cause });
  }
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${path}`);
  }
  return res.json() as Promise<T>;
}

function buildQuery(locale?: string, surface?: DonationSurface): string {
  const qs = new URLSearchParams();
  if (locale) qs.set('locale', locale);
  if (surface) qs.set('surface', surface);
  const s = qs.toString();
  return s ? `?${s}` : '';
}

export async function getPublicDonations(
  locale?: string,
  surface: DonationSurface = 'web',
): Promise<PublicDonationsPayload> {
  return fetchPublic<PublicDonationsPayload>(
    `/public/donations${buildQuery(locale, surface)}`,
  );
}

export async function getPublicDonationsForLocale(
  locale?: string,
  surface: DonationSurface = 'web',
): Promise<PublicDonationsPayload> {
  if (!locale) {
    return getPublicDonations(undefined, surface);
  }
  try {
    return await getPublicDonations(locale, surface);
  } catch {
    return getPublicDonations(undefined, surface);
  }
}

export function resolveNavbarDonation(
  payload: PublicDonationsPayload | null | undefined,
): PublicDonation | null {
  return payload?.navbarFeatured ?? null;
}
