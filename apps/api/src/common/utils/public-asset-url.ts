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

export function propertyUploadUrl(filename: string): string {
  return `${getApiBaseUrl()}/uploads/properties/${filename}`;
}

export function roomUploadUrl(filename: string): string {
  return `${getApiBaseUrl()}/uploads/rooms/${filename}`;
}

export function flightUploadUrl(filename: string): string {
  return `${getApiBaseUrl()}/uploads/flights/${filename}`;
}

export function vehicleUploadUrl(filename: string): string {
  return `${getApiBaseUrl()}/uploads/vehicles/${filename}`;
}

export function shipUploadUrl(filename: string): string {
  return `${getApiBaseUrl()}/uploads/ships/${filename}`;
}

export function activityUploadUrl(filename: string): string {
  return `${getApiBaseUrl()}/uploads/activities/${filename}`;
}

export function packageUploadUrl(filename: string): string {
  return `${getApiBaseUrl()}/uploads/packages/${filename}`;
}

function getApiPublicOrigin(): string {
  return getApiBaseUrl().replace(/\/api$/, '');
}

function resolveUploadPathname(pathname: string): string {
  if (pathname.startsWith('/api/uploads/')) return pathname;
  if (pathname.startsWith('/uploads/')) return `/api${pathname}`;
  return pathname;
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

  if (trimmed.startsWith('/')) {
    const pathname = resolveUploadPathname(trimmed);
    if (pathname.startsWith('/api/uploads/')) {
      return `${getApiPublicOrigin()}${pathname}`;
    }
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    const pathname = resolveUploadPathname(parsed.pathname);
    parsed.pathname = pathname;

    if (
      process.env.NODE_ENV !== 'production' &&
      (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') &&
      pathname.startsWith('/api/uploads/')
    ) {
      const port = process.env.API_PORT ?? '3000';
      parsed.hostname = 'localhost';
      parsed.port = port;
      parsed.protocol = 'http:';
      return parsed.toString();
    }

    if (
      process.env.NODE_ENV !== 'production' &&
      parsed.hostname.endsWith('africatourismgate.org') &&
      pathname.startsWith('/api/uploads/')
    ) {
      return `${getApiPublicOrigin()}${pathname}`;
    }

    return parsed.toString();
  } catch {
    return trimmed;
  }
}
