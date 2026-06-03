const PRODUCTION_API_BASE = 'https://app-africatourismgate.org/api';

/** Public API base URL including `/api` suffix. */
export function getApiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  if (process.env.NODE_ENV === 'production') {
    return PRODUCTION_API_BASE;
  }

  const port = process.env.API_PORT ?? '3000';
  return `http://localhost:${port}/api`;
}

export function brandingUploadUrl(filename: string): string {
  return `${getApiBaseUrl()}/uploads/branding/${filename}`;
}

/** Upgrades http→https and maps legacy `/uploads/` paths to `/api/uploads/`. */
export function normalizeBrandingAssetUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  let trimmed = url.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('http://') && process.env.NODE_ENV === 'production') {
    try {
      const { hostname } = new URL(trimmed);
      if (
        hostname !== 'localhost' &&
        hostname !== '127.0.0.1' &&
        hostname.endsWith('africatourismgate.org')
      ) {
        trimmed = `https://${trimmed.slice('http://'.length)}`;
      }
    } catch {
      return trimmed;
    }
  }

  try {
    const parsed = new URL(trimmed);
    if (
      parsed.hostname.endsWith('africatourismgate.org') &&
      parsed.pathname.startsWith('/uploads/') &&
      !parsed.pathname.startsWith('/api/uploads/')
    ) {
      parsed.pathname = `/api${parsed.pathname}`;
      return parsed.toString();
    }
  } catch {
    return trimmed;
  }

  return trimmed;
}
