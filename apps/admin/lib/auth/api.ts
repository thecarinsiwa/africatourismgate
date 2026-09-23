import {
  ApiClient,
  ApiHttpError,
  isSessionLockedApiError,
  type RequestOptions,
} from '@africatourismgate/api-client';
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
import { isSessionLocked, setSessionLocked } from './session-idle';

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

function sessionLockedError(): ApiHttpError {
  return new ApiHttpError(
    401,
    'Unauthorized',
    { code: 'SESSION_LOCKED' },
    'Session locked due to inactivity',
  );
}

function activateSessionLock(): void {
  setSessionLocked(true);
}

/** Refresh access token when expired; sync cookies → storage first. */
export async function ensureFreshSession(): Promise<StoredSession | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  if (isSessionLocked()) {
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
          // Keep local tokens for unlock; do not hand callers an expired access token.
          activateSessionLock();
          return null;
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

/**
 * Ensures a fresh access token (and idle-lock handling) around authenticated
 * requests so list/detail pages show the lock overlay instead of raw 401 errors.
 */
function attachAuthRefresh(client: ApiClient): ApiClient {
  const originalRequest = client.request.bind(client);
  const originalRequestBlob = client.requestBlob.bind(client);

  async function runWithAuthRefresh<T>(
    execute: () => Promise<T>,
    options?: RequestOptions,
  ): Promise<T> {
    if (options?.skipAuth) {
      return execute();
    }

    if (isSessionLocked()) {
      throw sessionLockedError();
    }

    const fresh = await ensureFreshSession();
    if (isSessionLocked()) {
      throw sessionLockedError();
    }
    client.setAccessToken(fresh?.accessToken ?? getSession()?.accessToken ?? null);

    try {
      return await execute();
    } catch (error) {
      if (isSessionLockedApiError(error)) {
        activateSessionLock();
        throw error;
      }

      if (
        error instanceof ApiHttpError &&
        error.status === 401 &&
        getSession()?.refreshToken
      ) {
        refreshInFlight = null;
        const retried = await ensureFreshSession();
        if (isSessionLocked()) {
          throw sessionLockedError();
        }
        if (!retried?.accessToken) {
          throw error;
        }
        client.setAccessToken(retried.accessToken);
        return execute();
      }

      throw error;
    }
  }

  client.request = ((path: string, options?: RequestOptions) =>
    runWithAuthRefresh(() => originalRequest(path, options), options)) as ApiClient['request'];

  client.requestBlob = ((path: string, options?: RequestOptions) =>
    runWithAuthRefresh(() => originalRequestBlob(path, options), options)) as ApiClient['requestBlob'];

  return client;
}

export function getApiClient(): ApiClient {
  const baseUrl = resolveApiBaseUrl();
  const session = getSession();
  return attachAuthRefresh(new ApiClient(baseUrl, session?.accessToken ?? null));
}

export async function getRefreshedApiClient(): Promise<ApiClient> {
  if (isSessionLocked()) {
    throw sessionLockedError();
  }
  const session = await ensureFreshSession();
  if (isSessionLocked()) {
    throw sessionLockedError();
  }
  return attachAuthRefresh(
    new ApiClient(resolveApiBaseUrl(), session?.accessToken ?? null),
  );
}

/** Runs an API call with a fresh token; retries once after refresh on 401. */
export async function withApiClient<T>(
  fn: (client: ApiClient) => Promise<T>,
): Promise<T> {
  let client = await getRefreshedApiClient();
  try {
    return await fn(client);
  } catch (error) {
    if (isSessionLockedApiError(error)) {
      activateSessionLock();
      throw error;
    }
    if (
      error instanceof ApiHttpError &&
      error.status === 401 &&
      getSession()?.refreshToken &&
      !isSessionLocked()
    ) {
      refreshInFlight = null;
      client = await getRefreshedApiClient();
      return fn(client);
    }
    throw error;
  }
}

/** True when a caught API error should open the idle-lock UI instead of a page error. */
export function shouldOpenSessionLock(error: unknown): boolean {
  if (isSessionLocked()) {
    return true;
  }
  if (isSessionLockedApiError(error)) {
    activateSessionLock();
    return true;
  }
  return false;
}
