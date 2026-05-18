const DEFAULT_ADMIN_URL = 'http://localhost:3001';
const PRODUCTION_ADMIN_URL = 'https://app-africatourismgate.org';

/**
 * Public admin app URL.
 * Production: https://app-africatourismgate.org (override with NEXT_PUBLIC_ADMIN_URL).
 * Development: http://localhost:3001
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
