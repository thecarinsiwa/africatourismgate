import type { AuthResponse, AuthTokens, AuthUser } from '@africatourismgate/types';
import {
  clearClientSessionCookies,
  getRememberFromDocumentCookies,
  getSessionFromDocumentCookies,
  setClientSessionCookies,
} from './cookies';
import { refreshAccessToken } from './refresh';

export const STORAGE_KEY = 'atg.pos.session';
export const AUTH_CHANGED_EVENT = 'atg:pos:auth-changed';

export type SessionPersistence = 'local' | 'session';

export type PosStoredSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: AuthUser;
  selectedOrganizationId: string | null;
  selectedOrganizationName?: string | null;
  selectedOrganizationSlug?: string | null;
};

const ACCESS_EXPIRY_SKEW_MS = 30_000;

function getStorage(persist: boolean): Storage {
  return persist ? localStorage : sessionStorage;
}

function getOtherStorage(persist: boolean): Storage {
  return persist ? sessionStorage : localStorage;
}

export function isAccessTokenExpired(
  session: PosStoredSession,
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

export function saveSession(session: PosStoredSession, remember?: boolean): void {
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

function readStoredSession(): PosStoredSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  for (const storage of [localStorage, sessionStorage]) {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw) as Partial<PosStoredSession>;
      if (!parsed.accessToken || !parsed.refreshToken || !parsed.user) {
        storage.removeItem(STORAGE_KEY);
        continue;
      }
      return normalizePosSession(parsed);
    } catch {
      storage.removeItem(STORAGE_KEY);
    }
  }

  return null;
}

function mergeSessionWithCookies(stored: PosStoredSession | null): PosStoredSession | null {
  const fromCookies = getSessionFromDocumentCookies();
  if (!fromCookies) {
    return stored;
  }

  if (!stored) {
    saveSession(fromCookies, getRememberFromDocumentCookies());
    return fromCookies;
  }

  const cookieIsNewer =
    fromCookies.expiresAt > stored.expiresAt ||
    fromCookies.accessToken !== stored.accessToken;
  const storedExpired = isAccessTokenExpired(stored);
  const cookieValid = !isAccessTokenExpired(fromCookies);

  if (!cookieIsNewer && !(storedExpired && cookieValid)) {
    return stored;
  }

  const merged: PosStoredSession = {
    ...stored,
    accessToken: fromCookies.accessToken,
    refreshToken: fromCookies.refreshToken,
    expiresAt: fromCookies.expiresAt,
    user: fromCookies.user,
    selectedOrganizationId:
      stored.selectedOrganizationId ?? fromCookies.selectedOrganizationId,
    selectedOrganizationName:
      stored.selectedOrganizationName ?? fromCookies.selectedOrganizationName ?? null,
    selectedOrganizationSlug:
      stored.selectedOrganizationSlug ?? fromCookies.selectedOrganizationSlug ?? null,
  };
  saveSession(merged, getRememberFromDocumentCookies());
  return merged;
}

export function getSession(): PosStoredSession | null {
  return mergeSessionWithCookies(readStoredSession());
}

/** Refresh the access token when expired; realign storage with middleware cookies. */
export async function ensureClientSession(): Promise<PosStoredSession | null> {
  let session = getSession();
  if (!session) {
    return null;
  }

  if (!isAccessTokenExpired(session)) {
    return session;
  }

  const tokens = await refreshAccessToken(session.refreshToken);
  if (!tokens) {
    return null;
  }

  session = tokensToStoredSession(tokens, {
    user: session.user,
    selectedOrganizationId: session.selectedOrganizationId,
    selectedOrganizationName: session.selectedOrganizationName,
    selectedOrganizationSlug: session.selectedOrganizationSlug,
  });
  saveSession(session, getRememberFromDocumentCookies());
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(AUTH_CHANGED_EVENT, { detail: { loggedIn: true } }),
    );
  }
  return session;
}

function normalizePosSession(partial: Partial<PosStoredSession>): PosStoredSession {
  return {
    accessToken: partial.accessToken!,
    refreshToken: partial.refreshToken!,
    expiresAt: partial.expiresAt ?? 0,
    user: partial.user!,
    selectedOrganizationId: partial.selectedOrganizationId ?? null,
    selectedOrganizationName: partial.selectedOrganizationName ?? null,
    selectedOrganizationSlug: partial.selectedOrganizationSlug ?? null,
  };
}

export function hasSession(): boolean {
  return Boolean(getSession()?.accessToken);
}

export function hasSelectedOrganization(): boolean {
  return Boolean(getSession()?.selectedOrganizationId);
}

/** Org de caisse requise pour catalogue / checkout POS. */
export function requireSelectedOrganizationId(): string {
  const organizationId = getSession()?.selectedOrganizationId?.trim();
  if (!organizationId) {
    throw new Error('Organisation de caisse non sélectionnée.');
  }
  return organizationId;
}

export function setSelectedOrganization(
  organization: { id: string; name: string; slug: string },
  remember?: boolean,
): void {
  const session = getSession();
  if (!session) return;

  saveSession(
    {
      ...session,
      selectedOrganizationId: organization.id,
      selectedOrganizationName: organization.name,
      selectedOrganizationSlug: organization.slug,
    },
    remember,
  );
}

export function clearSelectedOrganization(remember?: boolean): void {
  const session = getSession();
  if (!session) return;

  saveSession(
    {
      ...session,
      selectedOrganizationId: null,
      selectedOrganizationName: null,
      selectedOrganizationSlug: null,
    },
    remember ?? getSessionPersistence() === 'local',
  );
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

export function authResponseToStoredSession(response: AuthResponse): PosStoredSession {
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
    selectedOrganizationId: response.user.organizationId ?? null,
    selectedOrganizationName: null,
    selectedOrganizationSlug: null,
  };
}

export function tokensToStoredSession(
  tokens: AuthTokens,
  session: Pick<
    PosStoredSession,
    | 'user'
    | 'selectedOrganizationId'
    | 'selectedOrganizationName'
    | 'selectedOrganizationSlug'
  >,
): PosStoredSession {
  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresAt: Date.now() + tokens.expiresIn * 1000,
    user: session.user,
    selectedOrganizationId: session.selectedOrganizationId,
    selectedOrganizationName: session.selectedOrganizationName ?? null,
    selectedOrganizationSlug: session.selectedOrganizationSlug ?? null,
  };
}
