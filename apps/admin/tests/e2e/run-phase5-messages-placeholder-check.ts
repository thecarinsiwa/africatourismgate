/**
 * Visual check for /contenu/messages placeholder (P5-3).
 * pnpm exec tsx tests/e2e/run-phase5-messages-placeholder-check.ts
 */
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const ADMIN = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3001';
const API = process.env.PLAYWRIGHT_API_URL ?? 'http://localhost:3000';
const EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@africatourismgate.local';
const PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe123!';
const OUT = resolve(__dirname, '../../../test-results');

async function loginSession() {
  const response = await fetch(`${API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  if (!response.ok) throw new Error(`Login failed ${response.status}`);
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

async function main() {
  mkdirSync(OUT, { recursive: true });
  const session = await loginSession();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  await page.context().addCookies([
    { name: 'atg.admin.access', value: encodeURIComponent(session.accessToken), url: `${ADMIN}/` },
    { name: 'atg.admin.refresh', value: encodeURIComponent(session.refreshToken), url: `${ADMIN}/` },
    { name: 'atg.admin.expires', value: String(session.expiresAt), url: `${ADMIN}/` },
    {
      name: 'atg.admin.user',
      value: encodeURIComponent(JSON.stringify(session.user)),
      url: `${ADMIN}/`,
    },
  ]);
  await page.goto(`${ADMIN}/dashboard`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(
    ({ storageKey, stored }) => sessionStorage.setItem(storageKey, JSON.stringify(stored)),
    { storageKey: 'atg.admin.session', stored: session },
  );

  await page.goto(`${ADMIN}/contenu/messages`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: /Messages support|Support messages|Mensajes de soporte/i }).waitFor({
    timeout: 60_000,
  });
  await page.getByRole('heading', { name: /Messages dans les tickets|Messages live inside tickets|Los mensajes viven/i }).waitFor({
    timeout: 60_000,
  });
  await page.waitForTimeout(500);

  const snapshot = await page.evaluate(() => {
    const headers = Array.from(document.querySelectorAll('header h1, main h1, h1'));
    const h1 =
      headers.map((el) => el.textContent?.trim() ?? '').find((t) => /support|messages|mensajes/i.test(t)) ??
      null;
    const headerDesc =
      document.querySelector('header p')?.textContent?.trim() ??
      Array.from(document.querySelectorAll('p'))
        .map((p) => p.textContent?.trim() ?? '')
        .find((t) => /ticket/i.test(t) && t.length < 160) ??
      null;
    const emptyTitle =
      Array.from(document.querySelectorAll('h2'))
        .map((el) => el.textContent?.trim() ?? '')
        .find((t) => t.length > 0) ?? null;
    const emptyDesc =
      Array.from(document.querySelectorAll('[class*="border-dashed"] p'))
        .map((p) => p.textContent?.trim() ?? '')
        .find((t) => t.length > 40) ?? null;
    const cta = Array.from(document.querySelectorAll('[class*="border-dashed"] a, [class*="border-dashed"] button'))
      .map((el) => ({
        text: el.textContent?.trim() ?? '',
        href: (el as HTMLAnchorElement).href ?? '',
      }))
      .find((el) => el.text.length > 0);
    const dashed = !!document.querySelector('[class*="border-dashed"]');
    const svg = !!document.querySelector('[class*="border-dashed"] svg');
    return { h1, headerDesc, emptyTitle, emptyDesc, cta, dashed, svg, url: location.pathname };
  });

  await page.screenshot({ path: resolve(OUT, 'p5-3-contenu-messages.png'), fullPage: false });

  // Dark mode spot-check
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await page.waitForTimeout(200);
  await page.screenshot({ path: resolve(OUT, 'p5-3-contenu-messages-dark.png'), fullPage: false });

  await browser.close();
  console.log(JSON.stringify(snapshot, null, 2));

  const issues: string[] = [];
  if (snapshot.url !== '/contenu/messages') issues.push(`url=${snapshot.url}`);
  if (!snapshot.h1) issues.push('missing PageHeader h1');
  if (!snapshot.emptyTitle) issues.push('missing EmptyState title');
  if (!snapshot.dashed || !snapshot.svg) issues.push('missing illustrated EmptyState');
  if (!snapshot.cta?.href?.includes('/contenu/tickets')) issues.push('CTA tickets missing/wrong');
  if (issues.length) {
    console.error('P5-3 FAIL', issues);
    process.exit(1);
  }
  console.log('P5-3 OK');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
