const DEFAULT_ADMIN_URL = 'http://localhost:3001';
const PRODUCTION_ADMIN_URL = 'https://app-africatourismgate.org';
const DEFAULT_WEB_URL = 'http://localhost:3002';
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
