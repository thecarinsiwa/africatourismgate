# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-help.spec.ts >> Admin help center >> palette-commandes article documents phased search coverage
- Location: tests\e2e\admin-help.spec.ts:222:7

# Error details

```
Error: Échec login seed admin via API (429 — rate limit)
```

# Test source

```ts
  1   | import { expect, type Page } from '@playwright/test';
  2   | import type { AuthResponse, AuthUser } from '@africatourismgate/types';
  3   | 
  4   | export const SEED_ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@africatourismgate.local';
  5   | export const SEED_ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe123!';
  6   | 
  7   | /** Stable browser profile id for e2e API login (one session per admin browser). */
  8   | export const E2E_CLIENT_INSTANCE_ID = '00000000-0000-4000-8000-000000000701';
  9   | 
  10  | const API_URL = process.env.PLAYWRIGHT_API_URL ?? 'http://localhost:3000';
  11  | const ADMIN_ORIGIN = (process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3001').replace(/\/$/, '');
  12  | 
  13  | const ACCESS_COOKIE = 'atg.admin.access';
  14  | const REFRESH_COOKIE = 'atg.admin.refresh';
  15  | const EXPIRES_COOKIE = 'atg.admin.expires';
  16  | const USER_COOKIE = 'atg.admin.user';
  17  | const STORAGE_KEY = 'atg.admin.session';
  18  | const LAST_ACTIVITY_KEY = 'atg.admin.lastActivity';
  19  | const LOCKED_KEY = 'atg.admin.locked';
  20  | 
  21  | type StoredSession = {
  22  |   accessToken: string;
  23  |   refreshToken: string;
  24  |   expiresAt: number;
  25  |   user: AuthUser;
  26  | };
  27  | 
  28  | let cachedSession: StoredSession | null = null;
  29  | 
  30  | function encodeUser(user: AuthUser): string {
  31  |   return encodeURIComponent(JSON.stringify(user));
  32  | }
  33  | 
  34  | function toStoredSession(response: AuthResponse): StoredSession {
  35  |   if (
  36  |     !response.user ||
  37  |     !response.accessToken ||
  38  |     !response.refreshToken ||
  39  |     response.requiresVerification
  40  |   ) {
  41  |     throw new Error('Réponse de connexion seed admin invalide.');
  42  |   }
  43  | 
  44  |   return {
  45  |     accessToken: response.accessToken,
  46  |     refreshToken: response.refreshToken,
  47  |     expiresAt: Date.now() + response.expiresIn * 1000,
  48  |     user: response.user,
  49  |   };
  50  | }
  51  | 
  52  | export async function waitForApiHealth(timeoutMs = 120_000) {
  53  |   const deadline = Date.now() + timeoutMs;
  54  | 
  55  |   while (Date.now() < deadline) {
  56  |     try {
  57  |       const response = await fetch(`${API_URL}/api/health`);
  58  |       if (response.ok) {
  59  |         return;
  60  |       }
  61  |     } catch {
  62  |       // API still booting
  63  |     }
  64  |     await new Promise((resolve) => setTimeout(resolve, 2_000));
  65  |   }
  66  | 
  67  |   throw new Error(`API indisponible après ${timeoutMs}ms (${API_URL}/api/health)`);
  68  | }
  69  | 
  70  | async function fetchSeedAdminSession(force = false): Promise<StoredSession> {
  71  |   if (!force && cachedSession && Date.now() < cachedSession.expiresAt - 60_000) {
  72  |     return cachedSession;
  73  |   }
  74  | 
  75  |   const maxAttempts = 5;
  76  |   for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
  77  |     const response = await fetch(`${API_URL}/api/auth/login`, {
  78  |       method: 'POST',
  79  |       headers: { 'Content-Type': 'application/json' },
  80  |       body: JSON.stringify({
  81  |         email: SEED_ADMIN_EMAIL,
  82  |         password: SEED_ADMIN_PASSWORD,
  83  |         clientInstanceId: E2E_CLIENT_INSTANCE_ID,
  84  |       }),
  85  |     });
  86  | 
  87  |     if (response.status === 429) {
  88  |       await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)));
  89  |       continue;
  90  |     }
  91  | 
  92  |     if (!response.ok) {
  93  |       throw new Error(`Échec login seed admin via API (${response.status})`);
  94  |     }
  95  | 
  96  |     cachedSession = toStoredSession((await response.json()) as AuthResponse);
  97  |     return cachedSession;
  98  |   }
  99  | 
> 100 |   throw new Error('Échec login seed admin via API (429 — rate limit)');
      |         ^ Error: Échec login seed admin via API (429 — rate limit)
  101 | }
  102 | 
  103 | async function applySessionToPage(page: Page, session: StoredSession) {
  104 |   await page.context().addCookies([
  105 |     {
  106 |       name: ACCESS_COOKIE,
  107 |       value: encodeURIComponent(session.accessToken),
  108 |       url: `${ADMIN_ORIGIN}/`,
  109 |     },
  110 |     {
  111 |       name: REFRESH_COOKIE,
  112 |       value: encodeURIComponent(session.refreshToken),
  113 |       url: `${ADMIN_ORIGIN}/`,
  114 |     },
  115 |     {
  116 |       name: EXPIRES_COOKIE,
  117 |       value: String(session.expiresAt),
  118 |       url: `${ADMIN_ORIGIN}/`,
  119 |     },
  120 |     {
  121 |       name: USER_COOKIE,
  122 |       value: encodeUser(session.user),
  123 |       url: `${ADMIN_ORIGIN}/`,
  124 |     },
  125 |   ]);
  126 | 
  127 |   await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
  128 |   await page.evaluate(
  129 |     ({ storageKey, stored, lastActivityKey, lockedKey }) => {
  130 |       sessionStorage.setItem(storageKey, JSON.stringify(stored));
  131 |       sessionStorage.setItem(lastActivityKey, String(Date.now()));
  132 |       sessionStorage.removeItem(lockedKey);
  133 |     },
  134 |     {
  135 |       storageKey: STORAGE_KEY,
  136 |       stored: session,
  137 |       lastActivityKey: LAST_ACTIVITY_KEY,
  138 |       lockedKey: LOCKED_KEY,
  139 |     },
  140 |   );
  141 | 
  142 |   await expect(page).toHaveURL(/\/dashboard/, { timeout: 60_000 });
  143 | }
  144 | 
  145 | /** Connexion fiable pour e2e — session via API + cookies middleware. */
  146 | export async function loginAsSeedAdmin(page: Page) {
  147 |   await waitForApiHealth();
  148 | 
  149 |   const cookies = await page.context().cookies();
  150 |   const hasAccessCookie = cookies.some((cookie) => cookie.name === ACCESS_COOKIE && cookie.value);
  151 | 
  152 |   if (hasAccessCookie) {
  153 |     await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
  154 |     if (!page.url().includes('/login')) {
  155 |       if (cachedSession) {
  156 |         await page.evaluate(
  157 |           ({ storageKey, stored, lastActivityKey, lockedKey }) => {
  158 |             sessionStorage.setItem(storageKey, JSON.stringify(stored));
  159 |             sessionStorage.setItem(lastActivityKey, String(Date.now()));
  160 |             sessionStorage.removeItem(lockedKey);
  161 |           },
  162 |           {
  163 |             storageKey: STORAGE_KEY,
  164 |             stored: cachedSession,
  165 |             lastActivityKey: LAST_ACTIVITY_KEY,
  166 |             lockedKey: LOCKED_KEY,
  167 |           },
  168 |         );
  169 |       }
  170 |       await expect(page).toHaveURL(/\/dashboard/, { timeout: 60_000 });
  171 |       return;
  172 |     }
  173 |   }
  174 | 
  175 |   const session = await fetchSeedAdminSession();
  176 |   await applySessionToPage(page, session);
  177 | }
  178 | 
```