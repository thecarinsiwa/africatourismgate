import { ApiClient } from '@africatourismgate/api-client';
import { getSession } from './session';

const DEFAULT_DEV_API_URL = 'http://localhost:3000/api';
const PRODUCTION_API_URL = 'https://api.africatourismgate.org/api';

function isLocalApiUrl(url: string): boolean {
  return url.includes('localhost') || url.includes('127.0.0.1');
}

/** URL API côté serveur / middleware (pas de `window`). */
export function getApiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');

  if (fromEnv && !isLocalApiUrl(fromEnv)) {
    return fromEnv;
  }

  if (process.env.NODE_ENV === 'production') {
    return PRODUCTION_API_URL;
  }

  return fromEnv || DEFAULT_DEV_API_URL;
}

/**
 * URL de l’API dans le navigateur.
 * Repli production si le build a encore localhost (oubli de .env au `pnpm build`).
 */
export function resolveApiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');

  if (fromEnv && !isLocalApiUrl(fromEnv)) {
    return fromEnv;
  }

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'app-africatourismgate.org' || host.endsWith('.africatourismgate.org')) {
      return PRODUCTION_API_URL;
    }
  }

  return getApiBaseUrl();
}

export function getApiClient(): ApiClient {
  const baseUrl = resolveApiBaseUrl();
  const session = getSession();
  return new ApiClient(baseUrl, session?.accessToken ?? null);
}
