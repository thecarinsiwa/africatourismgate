const PRODUCTION_API_URL = 'https://app-africatourismgate.org/api';
const DEFAULT_DEV_API_PORT = '3010';

/** Base URL for public API calls from apps/web (browser + SSR). */
export function getWebApiUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  if (configured) return configured;

  if (process.env.NODE_ENV === 'production') {
    return PRODUCTION_API_URL;
  }

  const apiPort =
    process.env.NEXT_PUBLIC_API_PORT?.trim() || DEFAULT_DEV_API_PORT;
  return `http://localhost:${apiPort}/api`;
}
