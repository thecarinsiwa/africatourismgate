import type {
  DonationSurface,
  PublicDonation,
  PublicDonationsPayload,
} from '@africatourismgate/types';

const defaultApiUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://app-africatourismgate.org/api'
    : 'http://localhost:3000/api';

const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? defaultApiUrl).replace(/\/$/, '');

async function fetchPublic<T>(path: string): Promise<T> {
  const res = await fetch(`${apiUrl}${path}`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
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
