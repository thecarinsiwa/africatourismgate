const PRODUCTION_ADMIN_ORIGIN = 'https://app-africatourismgate.org';

/** Origin for static uploads (`/uploads/...`) — public API base URL without `/api`. */
export function getApiPublicOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '').replace(/\/api$/, '');

  if (process.env.NODE_ENV === 'production') {
    return PRODUCTION_ADMIN_ORIGIN;
  }

  const port = process.env.API_PORT ?? '3000';
  return `http://localhost:${port}`;
}

/** Upgrades http→https for ATG asset URLs stored behind an HTTP reverse proxy. */
export function ensureHttpsAssetUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed || !trimmed.startsWith('http://')) return trimmed || null;
  if (process.env.NODE_ENV !== 'production') return trimmed;

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
