import { normalizeBrandingAssetUrl } from '@africatourismgate/utils';
import { resolveApiBaseUrl } from './auth/api';

export type PublicBranding = {
  displayName: string;
  logoUrl: string | null;
  faviconUrl: string | null;
};

export type FetchPublicBrandingOptions = {
  organizationSlug?: string | null;
};

const defaultBranding: PublicBranding = {
  displayName: 'Africa Tourism Gate',
  logoUrl: null,
  faviconUrl: null,
};

export async function fetchPublicBranding(
  options: FetchPublicBrandingOptions = {},
): Promise<PublicBranding> {
  const apiUrl = resolveApiBaseUrl();
  const slug = options.organizationSlug?.trim();
  const query = slug ? `?organizationSlug=${encodeURIComponent(slug)}` : '';

  try {
    const response = await fetch(`${apiUrl}/organization-settings/public/branding${query}`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) return defaultBranding;
    const payload = (await response.json()) as Partial<PublicBranding>;
    return {
      displayName: payload.displayName?.trim() || defaultBranding.displayName,
      logoUrl: normalizeBrandingAssetUrl(payload.logoUrl?.trim() || null),
      faviconUrl: normalizeBrandingAssetUrl(payload.faviconUrl?.trim() || null),
    };
  } catch {
    return defaultBranding;
  }
}
