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

function resolveUploadPathname(pathname: string): string {
  if (pathname.startsWith('/api/uploads/')) return pathname;
  if (pathname.startsWith('/uploads/')) return `/api${pathname}`;
  return pathname;
}

function isDevRuntime(): boolean {
  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
    return true;
  }
  return false;
}

/**
 * Normalizes branding asset URLs: https upgrade + legacy `/uploads/` → `/api/uploads/`
 * (nginx only proxies `/api/` to NestJS on app-africatourismgate.org).
 * In local dev, rewrites ATG production upload URLs to the configured API origin so
 * `http://localhost:3000/api/uploads/...` serves files from the local API.
 */
export function normalizeBrandingAssetUrl(url: string | null | undefined): string | null {
  const upgraded = ensureHttpsAssetUrl(url);
  if (!upgraded) return null;

  if (upgraded.startsWith('/')) {
    const pathname = resolveUploadPathname(upgraded);
    if (pathname.startsWith('/api/uploads/')) {
      return `${getApiPublicOrigin()}${pathname}`;
    }
    return upgraded;
  }

  try {
    const parsed = new URL(upgraded);
    const pathname = resolveUploadPathname(parsed.pathname);
    parsed.pathname = pathname;

    if (
      isDevRuntime() &&
      parsed.hostname.endsWith('africatourismgate.org') &&
      pathname.startsWith('/api/uploads/')
    ) {
      return `${getApiPublicOrigin()}${pathname}`;
    }

    return parsed.toString();
  } catch {
    return upgraded;
  }
}
