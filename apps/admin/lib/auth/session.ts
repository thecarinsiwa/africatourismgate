import type { AuthResponse, AuthTokens, AuthUser } from '@africatourismgate/types';
import {
  clearClientSessionCookies,
  setClientSessionCookies,
} from './cookies';
import { clearSessionIdleState, resetSessionActivity } from './session-idle';

export const STORAGE_KEY = 'atg.admin.session';
export const AUTH_CHANGED_EVENT = 'atg:admin:auth-changed';

export type StoredSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: AuthUser;
};

const ACCESS_EXPIRY_SKEW_MS = 30_000;

export function isAccessTokenExpired(
  session: StoredSession,
  skewMs = ACCESS_EXPIRY_SKEW_MS,
): boolean {
  return Date.now() >= session.expiresAt - skewMs;
}

export function saveSession(session: StoredSession): void {
  if (typeof window === 'undefined') {
    return;
  }

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  localStorage.removeItem(STORAGE_KEY);
  setClientSessionCookies(session);
  resetSessionActivity();
}

export function getSession(): StoredSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function hasSession(): boolean {
  return Boolean(getSession()?.accessToken);
}

export function clearSession(): void {
  if (typeof window === 'undefined') {
    return;
  }
  sessionStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_KEY);
  clearClientSessionCookies();
  clearSessionIdleState();
}

export function clearAuthState(): void {
  clearSession();
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(AUTH_CHANGED_EVENT, { detail: { loggedIn: false } }),
  );
}

export function authResponseToStoredSession(response: AuthResponse): StoredSession {
  if (
    !response.user ||
    !response.accessToken ||
    !response.refreshToken ||
    response.requiresVerification
  ) {
    throw new Error('Réponse de connexion invalide.');
  }

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
