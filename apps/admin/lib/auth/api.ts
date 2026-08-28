import { ApiClient, ApiHttpError } from '@africatourismgate/api-client';
import { getApiBaseUrl, resolveApiBaseUrl } from './api-url';
import { getSessionFromDocumentCookies } from './cookies';
import { refreshAccessToken } from './refresh';
import {
  clearAuthState,
  getSession,
  isAccessTokenExpired,
  saveSession,
  tokensToStoredSession,
  type StoredSession,
} from './session';
import { setSessionLocked } from './session-idle';

export { getApiBaseUrl, resolveApiBaseUrl };

let refreshInFlight: Promise<StoredSession | null> | null = null;

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
    saveSession(fromCookies);
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
      .then((result) => {
        refreshInFlight = null;
        if (result === 'locked') {
          setSessionLocked(true);
          return session;
        }
        if (!result) {
          clearAuthState();
          return null;
        }
        const current = getSession() ?? session;
        const updated = tokensToStoredSession(result, current.user);
        saveSession(updated);
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
