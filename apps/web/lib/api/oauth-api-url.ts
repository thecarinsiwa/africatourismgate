import { getWebApiUrl } from './get-api-url';

const PRODUCTION_API_URL = 'https://app-africatourismgate.org/api';

/** True when the web app proxies API calls through localhost (remote dev mode). */
export function isProxiedDevApiUrl(apiUrl: string): boolean {
  const match = apiUrl.match(/^http:\/\/localhost:(\d+)\/api$/i);
  if (!match) return false;
  const apiPort = process.env.NEXT_PUBLIC_API_PORT ?? '3000';
  return match[1] !== apiPort;
}

/**
 * OAuth must hit the real API host (browser redirect chain).
 * The Next.js /api proxy only supports JSON fetch, not 302 → Google.
 */
export function getOAuthApiBaseUrl(): string {
  const configured = getWebApiUrl();
  if (!isProxiedDevApiUrl(configured)) {
    return configured;
  }
  return (
    process.env.ATG_REMOTE_API_URL?.replace(/\/$/, '') || PRODUCTION_API_URL
  );
}
