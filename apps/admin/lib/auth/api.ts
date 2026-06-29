import { ApiClient, ApiHttpError } from '@africatourismgate/api-client';
import {
  getRememberFromDocumentCookies,
  getSessionFromDocumentCookies,
} from './cookies';
import { refreshAccessToken } from './refresh';
import {
  clearAuthState,
  getSession,
  getSessionPersistence,
  isAccessTokenExpired,
  saveSession,
  tokensToStoredSession,
  type StoredSession,
} from './session';

/** Aligné sur API_PORT (défaut 3000) — voir packages/config/dev-api-url.mjs */
const DEFAULT_DEV_API_URL = 'http://localhost:3000/api';
const PRODUCTION_API_URL = 'https://app-africatourismgate.org/api';

let refreshInFlight: Promise<StoredSession | null> | null = null;

function isLocalApiUrl(url: string): boolean {
  return url.includes('localhost') || url.includes('127.0.0.1');
}

/** URL API côté serveur / middleware (pas de `window`). */
export function getApiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');

  if (process.env.NODE_ENV === 'production') {
    return fromEnv && !isLocalApiUrl(fromEnv) ? fromEnv : PRODUCTION_API_URL;
  }

  return fromEnv || DEFAULT_DEV_API_URL;
}

/**
 * URL de l’API dans le navigateur.
 * Repli production si le build a encore localhost (oubli de .env au `pnpm build`).
 */
export function resolveApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'app-africatourismgate.org' || host.endsWith('.africatourismgate.org')) {
      return PRODUCTION_API_URL;
    }
  }

  return getApiBaseUrl();
}

function syncSessionFromCookies(): StoredSession | null {
  const fromCookies = getSessionFromDocumentCookies();
  if (!fromCookies) {
    return getSession();
  }

  const stored = getSession();
  if (
    !stored ||
    fromCookies.expiresAt > stored.expiresAt ||
    fromCookies.accessToken !== stored.accessToken
  ) {
    saveSession(fromCookies, getRememberFromDocumentCookies());
    return fromCookies;
  }

  return stored;
}

/** Refresh access token when expired; sync cookies → storage first. */
export async function ensureFreshSession(): Promise<StoredSession | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  const session = syncSessionFromCookies();
  if (!session?.refreshToken) {
    return null;
  }

  if (!isAccessTokenExpired(session)) {
    return session;
  }

  if (!refreshInFlight) {
    const refreshToken = session.refreshToken;
    refreshInFlight = refreshAccessToken(refreshToken)
      .then((tokens) => {
        refreshInFlight = null;
        if (!tokens) {
          clearAuthState();
          return null;
        }
        const current = getSession() ?? session;
        const updated = tokensToStoredSession(tokens, current.user);
        const remember =
          getRememberFromDocumentCookies() || getSessionPersistence() === 'local';
        saveSession(updated, remember);
        return updated;
      })
      .catch(() => {
        refreshInFlight = null;
        clearAuthState();
        return null;
      });
  }

  return refreshInFlight;
}

export function getApiClient(): ApiClient {
  const baseUrl = resolveApiBaseUrl();
  const session = getSession();
  return new ApiClient(baseUrl, session?.accessToken ?? null);
}

export async function getRefreshedApiClient(): Promise<ApiClient> {
  const session = await ensureFreshSession();
  return new ApiClient(resolveApiBaseUrl(), session?.accessToken ?? null);
}

/** Runs an API call with a fresh token; retries once after refresh on 401. */
export async function withApiClient<T>(
  fn: (client: ApiClient) => Promise<T>,
): Promise<T> {
  let client = await getRefreshedApiClient();
  try {
    return await fn(client);
  } catch (error) {
    if (error instanceof ApiHttpError && error.status === 401 && getSession()?.refreshToken) {
      refreshInFlight = null;
      client = await getRefreshedApiClient();
      return fn(client);
    }
    throw error;
  }
}
