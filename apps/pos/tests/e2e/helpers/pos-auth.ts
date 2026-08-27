import { expect, type Page } from '@playwright/test';
import type { AuthResponse, AuthUser, Organization } from '@africatourismgate/types';
import {
  SEED_ADMIN_EMAIL,
  SEED_ADMIN_PASSWORD,
  SEED_ORG_ATG_NAME,
} from './pos-seed.constants';

/** Profil navigateur dédié aux e2e POS (évite le rate-limit login admin). */
export const E2E_CLIENT_INSTANCE_ID = '00000000-0000-4000-8000-000000000702';

const API_URL = process.env.PLAYWRIGHT_API_URL ?? 'http://localhost:3000';
const POS_ORIGIN = (process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3003').replace(
  /\/$/,
  '',
);

const ACCESS_COOKIE = 'atg.pos.access';
const REFRESH_COOKIE = 'atg.pos.refresh';
const EXPIRES_COOKIE = 'atg.pos.expires';
const USER_COOKIE = 'atg.pos.user';
const ORG_ID_COOKIE = 'atg.pos.org.id';
const ORG_NAME_COOKIE = 'atg.pos.org.name';
const ORG_SLUG_COOKIE = 'atg.pos.org.slug';
const STORAGE_KEY = 'atg.pos.session';

type StoredSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: AuthUser;
  selectedOrganizationId: string | null;
  selectedOrganizationName: string | null;
  selectedOrganizationSlug: string | null;
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
    selectedOrganizationId: response.user.organizationId ?? null,
    selectedOrganizationName: null,
    selectedOrganizationSlug: null,
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

export async function fetchSeedAdminSession(force = false): Promise<StoredSession> {
  if (!force && cachedSession && Date.now() < cachedSession.expiresAt - 60_000) {
    return cachedSession;
  }

  const maxAttempts = 8;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: SEED_ADMIN_EMAIL,
        password: SEED_ADMIN_PASSWORD,
        clientInstanceId: E2E_CLIENT_INSTANCE_ID,
      }),
    });

    if (response.status === 429) {
      await new Promise((resolve) => setTimeout(resolve, 2500 * (attempt + 1)));
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

async function fetchOrganizations(token: string): Promise<Organization[]> {
  const response = await fetch(`${API_URL}/api/auth/me/organizations`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Impossible de charger les organisations (${response.status})`);
  }

  return (await response.json()) as Organization[];
}

async function resolveOrganization(
  session: StoredSession,
  organizationName: string,
): Promise<StoredSession> {
  const organizations = await fetchOrganizations(session.accessToken);
  const organization = organizations.find((org) => org.name === organizationName);

  if (!organization) {
    throw new Error(`Organisation introuvable pour e2e : ${organizationName}`);
  }

  return {
    ...session,
    selectedOrganizationId: organization.id,
    selectedOrganizationName: organization.name,
    selectedOrganizationSlug: organization.slug,
  };
}

async function applySessionToPage(page: Page, session: StoredSession) {
  const cookies: Array<{ name: string; value: string; url: string }> = [
    {
      name: ACCESS_COOKIE,
      value: encodeURIComponent(session.accessToken),
      url: `${POS_ORIGIN}/`,
    },
    {
      name: REFRESH_COOKIE,
      value: encodeURIComponent(session.refreshToken),
      url: `${POS_ORIGIN}/`,
    },
    {
      name: EXPIRES_COOKIE,
      value: String(session.expiresAt),
      url: `${POS_ORIGIN}/`,
    },
    {
      name: USER_COOKIE,
      value: encodeUser(session.user),
      url: `${POS_ORIGIN}/`,
    },
  ];

  if (session.selectedOrganizationId) {
    cookies.push(
      {
        name: ORG_ID_COOKIE,
        value: encodeURIComponent(session.selectedOrganizationId),
        url: `${POS_ORIGIN}/`,
      },
      {
        name: ORG_NAME_COOKIE,
        value: encodeURIComponent(session.selectedOrganizationName ?? ''),
        url: `${POS_ORIGIN}/`,
      },
      {
        name: ORG_SLUG_COOKIE,
        value: encodeURIComponent(session.selectedOrganizationSlug ?? ''),
        url: `${POS_ORIGIN}/`,
      },
    );
  }

  await page.context().addCookies(cookies);

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(
    ({ storageKey, stored }) => {
      sessionStorage.setItem(storageKey, JSON.stringify(stored));
      localStorage.removeItem(storageKey);
    },
    { storageKey: STORAGE_KEY, stored: session },
  );

  if (session.selectedOrganizationId) {
    await expect(page).toHaveURL('/', { timeout: 60_000 });
  }
}

/** Efface l’organisation sélectionnée (session + cookies) pour tester /select-org. */
export async function clearPosOrganization(page: Page) {
  await page.evaluate(
    ({ storageKey, orgCookies }) => {
      const read = sessionStorage.getItem(storageKey) ?? localStorage.getItem(storageKey);
      if (read) {
        const session = JSON.parse(read) as Record<string, unknown>;
        session.selectedOrganizationId = null;
        session.selectedOrganizationName = null;
        session.selectedOrganizationSlug = null;
        if (sessionStorage.getItem(storageKey)) {
          sessionStorage.setItem(storageKey, JSON.stringify(session));
        }
        if (localStorage.getItem(storageKey)) {
          localStorage.setItem(storageKey, JSON.stringify(session));
        }
      }

      const expired = '; Path=/; Max-Age=0; SameSite=Lax';
      for (const name of orgCookies) {
        document.cookie = `${name}=${expired}`;
      }
    },
    {
      storageKey: STORAGE_KEY,
      orgCookies: [ORG_ID_COOKIE, ORG_NAME_COOKIE, ORG_SLUG_COOKIE],
    },
  );
}

export async function selectOrganization(page: Page, organizationName: string) {
  await page.getByRole('button', { name: new RegExp(organizationName) }).click();
  await expect(page).toHaveURL('/', { timeout: 60_000 });
  await expect(page.getByText(organizationName)).toBeVisible();
}

/** Connexion fiable pour e2e — session via API + cookies middleware. */
export async function loginAsPosEmployee(
  page: Page,
  options: { organizationName?: string } = {},
) {
  await waitForApiHealth();

  const organizationName = options.organizationName ?? SEED_ORG_ATG_NAME;
  let session = await fetchSeedAdminSession();
  session = await resolveOrganization(session, organizationName);
  await applySessionToPage(page, session);
}
