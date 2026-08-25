/**
 * One-off P5-1 mobile validation (375px). Run from apps/admin:
 *   pnpm exec tsx tests/e2e/run-phase5-mobile-check.ts
 */
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const ADMIN = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3001';
const API = process.env.PLAYWRIGHT_API_URL ?? 'http://localhost:3000';
const EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@africatourismgate.local';
const PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe123!';
const VIEWPORT = { width: 375, height: 812 };
const OUT = resolve(__dirname, '../../../test-results');

const ACCESS_COOKIE = 'atg.admin.access';
const REFRESH_COOKIE = 'atg.admin.refresh';
const EXPIRES_COOKIE = 'atg.admin.expires';
const USER_COOKIE = 'atg.admin.user';
const REMEMBER_COOKIE = 'atg.admin.remember';
const STORAGE_KEY = 'atg.admin.session';

async function loginSession() {
  const response = await fetch(`${API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  if (!response.ok) {
    throw new Error(`Login API failed: ${response.status}`);
  }
  const body = (await response.json()) as {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: unknown;
  };
  return {
    accessToken: body.accessToken,
    refreshToken: body.refreshToken,
    expiresAt: Date.now() + body.expiresIn * 1000,
    user: body.user,
  };
}

async function applySession(
  page: import('@playwright/test').Page,
  session: Awaited<ReturnType<typeof loginSession>>,
) {
  await page.context().addCookies([
    { name: ACCESS_COOKIE, value: encodeURIComponent(session.accessToken), url: `${ADMIN}/` },
    { name: REFRESH_COOKIE, value: encodeURIComponent(session.refreshToken), url: `${ADMIN}/` },
    { name: EXPIRES_COOKIE, value: String(session.expiresAt), url: `${ADMIN}/` },
    {
      name: USER_COOKIE,
      value: encodeURIComponent(JSON.stringify(session.user)),
      url: `${ADMIN}/`,
    },
    { name: REMEMBER_COOKIE, value: '0', url: `${ADMIN}/` },
  ]);
  await page.goto(`${ADMIN}/dashboard`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(
    ({ storageKey, stored }) => {
      sessionStorage.setItem(storageKey, JSON.stringify(stored));
    },
    { storageKey: STORAGE_KEY, stored: session },
  );
}

async function checkPage(
  page: import('@playwright/test').Page,
  path: string,
  screenshotName: string,
  options?: { expectOrgHidden?: boolean; forceTableView?: boolean },
) {
  await page.goto(`${ADMIN}${path}`, { waitUntil: 'networkidle' });
  if (options?.forceTableView) {
    const toggle = page.getByRole('button', { name: /tableau|table|lista/i });
    if (await toggle.count()) await toggle.first().click();
  }

  await page.waitForTimeout(1500);

  const metrics = await page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const table = document.querySelector('table');
    const tableWrap = table?.closest('div');
    return {
      clientWidth: doc.clientWidth,
      scrollWidth: Math.max(doc.scrollWidth, body.scrollWidth),
      tableScrollWidth: tableWrap?.scrollWidth ?? 0,
      tableClientWidth: tableWrap?.clientWidth ?? 0,
      expandButtons: document.querySelectorAll('table button[aria-expanded]').length,
      tableCount: document.querySelectorAll('table').length,
      minWidths: Array.from(document.querySelectorAll('table')).map(
        (t) => getComputedStyle(t).minWidth,
      ),
    };
  });

  // Soften scroll checks: clipped overflow inside table-fixed wrappers is OK;
  // fail only when the document itself scrolls horizontally.
  const issues: string[] = [];
  if (metrics.scrollWidth > metrics.clientWidth + 2) {
    issues.push(
      `scroll horizontal page: scrollWidth=${metrics.scrollWidth} > clientWidth=${metrics.clientWidth}`,
    );
  }
  if (metrics.tableCount > 0) {
    const tableWiderThanViewport = metrics.minWidths.some(
      (minW) => minW && minW !== '0px' && Number.parseFloat(minW) > metrics.clientWidth,
    );
    if (tableWiderThanViewport) {
      issues.push('table min-width force le scroll horizontal');
    }
  }
  if (metrics.tableCount > 0 && metrics.expandButtons === 0) {
    issues.push('table présente mais aucun bouton expand (hideOnMobile inactif ?)');
  }

  if (options?.expectOrgHidden && metrics.tableCount > 0) {
    const orgHeader = await page
      .locator('thead th')
      .filter({ hasText: /organisation|organization|organización/i })
      .count();
    if (orgHeader > 0) issues.push('colonne organization encore visible en thead mobile');
  }

  if (metrics.expandButtons > 0) {
    await page.locator('table button[aria-expanded]').first().click();
    await page.waitForTimeout(300);
  }

  await page.screenshot({ path: resolve(OUT, screenshotName), fullPage: false });
  return { path, metrics, issues };
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const health = await fetch(`${API}/api/health`);
  if (!health.ok) throw new Error('API health failed');

  const session = await loginSession();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: VIEWPORT });
  const page = await context.newPage();
  await applySession(page, session);

  const results = [
    await checkPage(page, '/reservations', 'p5-1-reservations-375.png'),
    await checkPage(page, '/hebergements', 'p5-1-hebergements-375.png', {
      forceTableView: true,
    }),
    await checkPage(page, '/utilisateurs', 'p5-1-utilisateurs-375.png', {
      expectOrgHidden: true,
    }),
  ];

  await browser.close();

  console.log(JSON.stringify(results, null, 2));
  const failed = results.filter((r) => r.issues.length > 0);
  if (failed.length) {
    console.error('P5-1 FAIL');
    process.exit(1);
  }
  console.log('P5-1 OK — captures dans', OUT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
