import type { AuthResponse, AuthUser } from '@africatourismgate/types';

export const STORAGE_KEY = 'atg.admin.session';

export type StoredSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: AuthUser;
};

function getStorage(persist: boolean): Storage {
  return persist ? localStorage : sessionStorage;
}

function getOtherStorage(persist: boolean): Storage {
  return persist ? sessionStorage : localStorage;
}

export function saveSession(session: StoredSession, remember: boolean): void {
  const storage = getStorage(remember);
  const other = getOtherStorage(remember);
  storage.setItem(STORAGE_KEY, JSON.stringify(session));
  other.removeItem(STORAGE_KEY);
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

export function clearSession(): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
}

export function authResponseToStoredSession(response: AuthResponse): StoredSession {
  return {
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    expiresAt: Date.now() + response.expiresIn * 1000,
    user: response.user,
  };
}
