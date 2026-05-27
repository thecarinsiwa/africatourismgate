import { resolveApiBaseUrl } from './auth/api';

export type PublicBranding = {
  displayName: string;
  logoUrl: string | null;
  faviconUrl: string | null;
};

const defaultBranding: PublicBranding = {
  displayName: 'Africa Tourism Gate',
  logoUrl: null,
  faviconUrl: null,
};

export async function fetchPublicBranding(): Promise<PublicBranding> {
  const apiUrl = resolveApiBaseUrl();
  try {
    const response = await fetch(`${apiUrl}/organization-settings/public/branding`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) return defaultBranding;
    const payload = (await response.json()) as Partial<PublicBranding>;
    return {
      displayName: payload.displayName?.trim() || defaultBranding.displayName,
      logoUrl: payload.logoUrl?.trim() || null,
      faviconUrl: payload.faviconUrl?.trim() || null,
    };
  } catch {
    return defaultBranding;
  }
}
