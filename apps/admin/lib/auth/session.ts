import type { AuthResponse, AuthTokens, AuthUser } from '@africatourismgate/types';
import {
  clearClientSessionCookies,
  setClientSessionCookies,
} from './cookies';

export const STORAGE_KEY = 'atg.admin.session';
export const AUTH_CHANGED_EVENT = 'atg:admin:auth-changed';

export type SessionPersistence = 'local' | 'session';

export type StoredSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: AuthUser;
};

const ACCESS_EXPIRY_SKEW_MS = 30_000;

function getStorage(persist: boolean): Storage {
  return persist ? localStorage : sessionStorage;
}

function getOtherStorage(persist: boolean): Storage {
  return persist ? sessionStorage : localStorage;
}

export function isAccessTokenExpired(
  session: StoredSession,
  skewMs = ACCESS_EXPIRY_SKEW_MS,
): boolean {
  return Date.now() >= session.expiresAt - skewMs;
}

export function getSessionPersistence(): SessionPersistence | null {
  if (typeof window === 'undefined') return null;
  if (localStorage.getItem(STORAGE_KEY)) return 'local';
  if (sessionStorage.getItem(STORAGE_KEY)) return 'session';
  return null;
}

export function saveSession(session: StoredSession, remember?: boolean): void {
  if (typeof window === 'undefined') {
    return;
  }

  const persist = remember ?? getSessionPersistence() === 'local';
  const storage = getStorage(persist);
  const other = getOtherStorage(persist);
  storage.setItem(STORAGE_KEY, JSON.stringify(session));
  other.removeItem(STORAGE_KEY);
  setClientSessionCookies(session, persist);
}

export function getSession(): StoredSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  for (const storage of [localStorage, sessionStorage]) {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) continue;

    try {
      return JSON.parse(raw) as StoredSession;
    } catch {
      storage.removeItem(STORAGE_KEY);
    }
  }

  return null;
}

export function hasSession(): boolean {
  return Boolean(getSession()?.accessToken);
}

export function clearSession(): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
  clearClientSessionCookies();
}

export function clearAuthState(): void {
  clearSession();
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(AUTH_CHANGED_EVENT, { detail: { loggedIn: false } }),
  );
}

export function authResponseToStoredSession(response: AuthResponse): StoredSession {
  return {
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    expiresAt: Date.now() + response.expiresIn * 1000,
    user: response.user,
  };
}

export function tokensToStoredSession(
  tokens: AuthTokens,
  user: StoredSession['user'],
): StoredSession {
  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresAt: Date.now() + tokens.expiresIn * 1000,
    user,
  };
}
