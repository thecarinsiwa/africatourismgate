import { expect, type Page } from '@playwright/test';
import type { AuthResponse, AuthUser } from '@africatourismgate/types';

export const SEED_ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@africatourismgate.local';
export const SEED_ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe123!';

const API_URL = process.env.PLAYWRIGHT_API_URL ?? 'http://localhost:3000';
const ADMIN_ORIGIN = (process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3001').replace(/\/$/, '');

const ACCESS_COOKIE = 'atg.admin.access';
const REFRESH_COOKIE = 'atg.admin.refresh';
const EXPIRES_COOKIE = 'atg.admin.expires';
const USER_COOKIE = 'atg.admin.user';
const STORAGE_KEY = 'atg.admin.session';

type StoredSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: AuthUser;
};

let cachedSession: StoredSession | null = null;

function encodeUser(user: AuthUser): string {
  return encodeURIComponent(JSON.stringify(user));
}

function toStoredSession(response: AuthResponse): StoredSession {
  if (
    !response.user ||
    !response.accessToken ||
    !response.refreshToken ||
    response.requiresVerification
  ) {
    throw new Error('Réponse de connexion seed admin invalide.');
  }

  return {
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    expiresAt: Date.now() + response.expiresIn * 1000,
    user: response.user,
  };
}

export async function waitForApiHealth(timeoutMs = 120_000) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${API_URL}/api/health`);
      if (response.ok) {
        return;
      }
    } catch {
      // API still booting
    }
    await new Promise((resolve) => setTimeout(resolve, 2_000));
  }

  throw new Error(`API indisponible après ${timeoutMs}ms (${API_URL}/api/health)`);
}

async function fetchSeedAdminSession(force = false): Promise<StoredSession> {
  if (!force && cachedSession && Date.now() < cachedSession.expiresAt - 60_000) {
    return cachedSession;
  }

  const maxAttempts = 5;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: SEED_ADMIN_EMAIL,
        password: SEED_ADMIN_PASSWORD,
      }),
    });

    if (response.status === 429) {
      await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)));
      continue;
    }

    if (!response.ok) {
      throw new Error(`Échec login seed admin via API (${response.status})`);
    }

    cachedSession = toStoredSession((await response.json()) as AuthResponse);
    return cachedSession;
  }

  throw new Error('Échec login seed admin via API (429 — rate limit)');
}

async function applySessionToPage(page: Page, session: StoredSession) {
  await page.context().addCookies([
    {
      name: ACCESS_COOKIE,
      value: encodeURIComponent(session.accessToken),
      url: `${ADMIN_ORIGIN}/`,
    },
    {
      name: REFRESH_COOKIE,
      value: encodeURIComponent(session.refreshToken),
      url: `${ADMIN_ORIGIN}/`,
    },
    {
      name: EXPIRES_COOKIE,
      value: String(session.expiresAt),
      url: `${ADMIN_ORIGIN}/`,
    },
    {
      name: USER_COOKIE,
      value: encodeUser(session.user),
      url: `${ADMIN_ORIGIN}/`,
    },
  ]);

  await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
  await page.evaluate(
    ({ storageKey, stored }) => {
      sessionStorage.setItem(storageKey, JSON.stringify(stored));
    },
    { storageKey: STORAGE_KEY, stored: session },
  );

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 60_000 });
}

/** Connexion fiable pour e2e — session via API + cookies middleware. */
export async function loginAsSeedAdmin(page: Page) {
  await waitForApiHealth();

  const cookies = await page.context().cookies();
  const hasAccessCookie = cookies.some((cookie) => cookie.name === ACCESS_COOKIE && cookie.value);

  if (hasAccessCookie) {
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    if (!page.url().includes('/login')) {
      if (cachedSession) {
        await page.evaluate(
          ({ storageKey, stored }) => {
            sessionStorage.setItem(storageKey, JSON.stringify(stored));
          },
          { storageKey: STORAGE_KEY, stored: cachedSession },
        );
      }
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 60_000 });
      return;
    }
  }

  const session = await fetchSeedAdminSession();
  await applySessionToPage(page, session);
}
