import type { AuthResponse, AuthUser, AuthTokens } from '@africatourismgate/api-client';
import { refreshAuthTokens } from '../api/auth';
import {
  clearSessionIdleState,
  resetSessionActivity,
  setSessionLocked,
} from './session-idle';

const WEB_SESSION_KEY = 'atg.web.session';
const ACCESS_SKEW_MS = 30_000;

export const AUTH_CHANGED_EVENT = 'atg:auth-changed';

export type WebStoredSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: AuthUser | null;
};

function readStorageSession(): WebStoredSession | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(WEB_SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as WebStoredSession;
    if (!parsed.accessToken || !parsed.refreshToken || !parsed.expiresAt) {
      sessionStorage.removeItem(WEB_SESSION_KEY);
      return null;
    }
    return parsed;
  } catch {
    sessionStorage.removeItem(WEB_SESSION_KEY);
    return null;
  }
}

export function authResponseToWebSession(auth: AuthResponse): WebStoredSession {
  return {
    accessToken: auth.accessToken,
    refreshToken: auth.refreshToken,
    expiresAt: Date.now() + auth.expiresIn * 1000,
    user: auth.user ?? null,
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

export function saveWebSession(session: WebStoredSession): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(WEB_SESSION_KEY, JSON.stringify(session));
  localStorage.removeItem(WEB_SESSION_KEY);
  resetSessionActivity();
}

export function getWebSession(): WebStoredSession | null {
  return readStorageSession();
}

export function hasWebSession(): boolean {
  return Boolean(getWebSession()?.accessToken);
}

export function clearWebSession(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(WEB_SESSION_KEY);
  localStorage.removeItem(WEB_SESSION_KEY);
  clearSessionIdleState();
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

  try {
    const refreshed = await refreshAuthTokens(session.refreshToken);
    if (refreshed === 'locked') {
      setSessionLocked(true);
      return session.accessToken;
    }
    const nextSession = authTokensToWebSession(refreshed, session.user);
    saveWebSession(nextSession);
    return nextSession.accessToken;
  } catch {
    clearWebAuthState();
    return null;
  }
}

export function getClientAccessToken(): string | null {
  return getWebSession()?.accessToken ?? null;
}
