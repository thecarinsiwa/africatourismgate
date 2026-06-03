const PRODUCTION_ADMIN_URL = 'https://app-africatourismgate.org';
const PRODUCTION_WEB_URL = 'https://africatourismgate.org';

/**
 * Back-office admin (apps/admin).
 * Production: https://app-africatourismgate.org — never the root domain.
 */
export function getAdminAppUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_ADMIN_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  if (process.env.NODE_ENV === 'production') {
    return PRODUCTION_ADMIN_URL;
  }

  const port = process.env.ADMIN_PORT ?? '3001';
  return `http://localhost:${port}`;
}

/**
 * Site public (apps/web).
 * Production: https://africatourismgate.org
 */
export function getPublicWebUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_WEB_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  if (process.env.NODE_ENV === 'production') {
    return PRODUCTION_WEB_URL;
  }

  const port = process.env.WEB_PORT ?? '3002';
  return `http://localhost:${port}`;
}

export function getAdminLoginUrl(): string {
  return `${getAdminAppUrl()}/login`;
}

/** Origin for static uploads (`/uploads/...`) — API base URL without `/api`. */
export function getApiPublicOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '').replace(/\/api$/, '');

  if (process.env.NODE_ENV === 'production') {
    return PRODUCTION_ADMIN_URL;
  }

  const port = process.env.API_PORT ?? '3000';
  return `http://localhost:${port}`;
}

/**
 * Upgrades http→https for ATG asset URLs (fixes mixed content when URLs were stored as http behind a proxy).
 */
export function ensureHttpsAssetUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed || !trimmed.startsWith('http://')) return trimmed || null;

  const upgradeInBrowser =
    typeof window !== 'undefined' && window.location.protocol === 'https:';
  const upgradeInProduction = process.env.NODE_ENV === 'production';

  if (!upgradeInBrowser && !upgradeInProduction) return trimmed;

  try {
    const { hostname } = new URL(trimmed);
    if (hostname === 'localhost' || hostname === '127.0.0.1') return trimmed;
    if (hostname.endsWith('africatourismgate.org')) {
      return `https://${trimmed.slice('http://'.length)}`;
    }
  } catch {
    return trimmed;
  }
  return trimmed;
}
