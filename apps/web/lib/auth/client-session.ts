import type { AuthResponse, AuthUser, AuthTokens } from '@africatourismgate/api-client';
import { refreshAuthTokens } from '../api/auth';

const WEB_SESSION_KEY = 'atg.web.session';
const ACCESS_SKEW_MS = 30_000;

export const AUTH_CHANGED_EVENT = 'atg:auth-changed';

export type WebSessionPersistence = 'local' | 'session';

export type WebStoredSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: AuthUser | null;
};

function readStorageSession(storage: Storage): WebStoredSession | null {
  const raw = storage.getItem(WEB_SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as WebStoredSession;
    if (!parsed.accessToken || !parsed.refreshToken || !parsed.expiresAt) {
      storage.removeItem(WEB_SESSION_KEY);
      return null;
    }
    return parsed;
  } catch {
    storage.removeItem(WEB_SESSION_KEY);
    return null;
  }
}

export function authResponseToWebSession(auth: AuthResponse): WebStoredSession {
  return {
    accessToken: auth.accessToken,
    refreshToken: auth.refreshToken,
    expiresAt: Date.now() + auth.expiresIn * 1000,
    user: auth.user,
  };
}

export function authTokensToWebSession(
  tokens: AuthTokens,
  user: AuthUser | null,
): WebStoredSession {
  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresAt: Date.now() + tokens.expiresIn * 1000,
    user,
  };
}

export function getWebSessionPersistence(): WebSessionPersistence | null {
  if (typeof window === 'undefined') return null;
  if (localStorage.getItem(WEB_SESSION_KEY)) return 'local';
  if (sessionStorage.getItem(WEB_SESSION_KEY)) return 'session';
  return null;
}

export function saveWebSession(session: WebStoredSession, remember?: boolean): void {
  if (typeof window === 'undefined') return;
  const useLocal = remember ?? getWebSessionPersistence() === 'local';
  const storage = useLocal ? localStorage : sessionStorage;
  const otherStorage = useLocal ? sessionStorage : localStorage;
  storage.setItem(WEB_SESSION_KEY, JSON.stringify(session));
  otherStorage.removeItem(WEB_SESSION_KEY);
}

export function getWebSession(): WebStoredSession | null {
  if (typeof window === 'undefined') return null;
  for (const storage of [localStorage, sessionStorage]) {
    const session = readStorageSession(storage);
    if (session) return session;
  }
  return null;
}

export function hasWebSession(): boolean {
  return Boolean(getWebSession()?.accessToken);
}

export function clearWebSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(WEB_SESSION_KEY);
  sessionStorage.removeItem(WEB_SESSION_KEY);
}

export function clearWebAuthState(): void {
  clearWebSession();
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(AUTH_CHANGED_EVENT, { detail: { loggedIn: false } }),
  );
}

function isAccessTokenExpired(session: WebStoredSession): boolean {
  return Date.now() >= session.expiresAt - ACCESS_SKEW_MS;
}

export async function ensureClientAccessToken(): Promise<string | null> {
  const session = getWebSession();
  if (!session) return null;
  if (!isAccessTokenExpired(session)) return session.accessToken;

  const persistence = getWebSessionPersistence();

  try {
    const refreshed = await refreshAuthTokens(session.refreshToken);
    const nextSession = authTokensToWebSession(refreshed, session.user);
    saveWebSession(nextSession, persistence === 'local');
    return nextSession.accessToken;
  } catch {
    clearWebAuthState();
    return null;
  }
}

export function getClientAccessToken(): string | null {
  return getWebSession()?.accessToken ?? null;
}
