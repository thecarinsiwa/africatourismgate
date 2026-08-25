/**
 * P5-6 a11y spot-check + 375px captures.
 * pnpm exec tsx tests/e2e/run-phase5-a11y-spotcheck.ts
 */
import { chromium, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ADMIN = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3001';
const API = process.env.PLAYWRIGHT_API_URL ?? 'http://localhost:3000';
const EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@africatourismgate.local';
const PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe123!';
const OUT = resolve(__dirname, '../../../test-results');

type Finding = {
  page: string;
  severity: 'error' | 'warn' | 'info';
  issue: string;
};

/** Browser-side audit as plain string to avoid tsx/esbuild __name injection. */
const AUDIT_SOURCE = `({ pageLabel }) => {
  const findings = [];
  const h1 = document.querySelectorAll('h1');
  if (h1.length === 0) findings.push({ page: pageLabel, severity: 'error', issue: 'Aucun h1' });
  else if (h1.length > 1) findings.push({ page: pageLabel, severity: 'warn', issue: h1.length + ' éléments h1 (idéal : 1)' });

  for (const img of Array.from(document.querySelectorAll('img'))) {
    if (!img.hasAttribute('alt')) {
      findings.push({ page: pageLabel, severity: 'error', issue: 'img sans alt: ' + String(img.src).slice(0, 80) });
    }
  }

  for (const el of Array.from(document.querySelectorAll('button, a, [role="button"], input, select, textarea'))) {
    const html = el;
    if (html.getAttribute('aria-hidden') === 'true') continue;
    const tag = html.tagName.toLowerCase();
    const type = (html.type || '').toLowerCase();
    const text = (html.innerText || html.textContent || '').replace(/\\s+/g, ' ').trim();
    const aria = html.getAttribute('aria-label') || html.getAttribute('aria-labelledby') || html.getAttribute('title') || '';
    const labelledById = html.getAttribute('aria-labelledby');
    const labelEl = (tag === 'input' || tag === 'select' || tag === 'textarea') && html.id
      ? document.querySelector('label[for="' + html.id + '"]')
      : null;
    const hasName = !!(text || aria || labelEl || (labelledById && document.getElementById(labelledById)));
    const isIconOnly =
      (tag === 'button' || tag === 'a' || html.getAttribute('role') === 'button') &&
      text.length === 0 &&
      !html.querySelector('img[alt]') &&
      (!!html.querySelector('svg') || tag === 'button');

    if (isIconOnly && !aria && !html.querySelector('.sr-only, [class*="sr-only"]')) {
      const cls = html.className ? '.' + String(html.className).split(' ')[0] : '';
      findings.push({ page: pageLabel, severity: 'error', issue: 'Contrôle icône sans nom accessible (' + tag + cls + ')' });
    } else if ((tag === 'input' || tag === 'select' || tag === 'textarea') && !hasName && type !== 'hidden') {
      findings.push({ page: pageLabel, severity: 'warn', issue: 'Champ ' + tag + ' sans label accessible (id=' + (html.id || '—') + ')' });
    }
  }

  const parseRgb = (color) => {
    const m = String(color).match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)/);
    return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
  };
  const relLuminance = (rgb) => {
    const srgb = rgb.map((c) => {
      const v = c / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
  };
  const contrastRatio = (fg, bg) => {
    const a = parseRgb(fg);
    const b = parseRgb(bg);
    if (!a || !b) return null;
    const L1 = relLuminance(a);
    const L2 = relLuminance(b);
    return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
  };

  for (const el of Array.from(document.querySelectorAll('.text-atg-muted, [class*="text-atg-muted"]')).slice(0, 8)) {
    const style = getComputedStyle(el);
    let bgEl = el;
    let bg = 'rgba(0,0,0,0)';
    while (bgEl) {
      bg = getComputedStyle(bgEl).backgroundColor;
      if (!bg.includes('0)')) break;
      bgEl = bgEl.parentElement;
    }
    const ratio = contrastRatio(style.color, bg);
    if (ratio != null && ratio < 4.5 && style.fontSize && parseFloat(style.fontSize) >= 14) {
      findings.push({
        page: pageLabel,
        severity: 'warn',
        issue: 'Contraste muted faible (~' + ratio.toFixed(2) + ':1) — ' + String(el.innerText || '').slice(0, 40),
      });
    }
  }

  return findings;
}`;

async function loginSession() {
  const response = await fetch(`${API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  if (!response.ok) throw new Error(`Login API ${response.status}`);
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

async function applySession(page: Page, session: Awaited<ReturnType<typeof loginSession>>) {
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
  await page.goto(`${ADMIN}/dashboard`, { waitUntil: 'domcontentloaded', timeout: 120_000 });
  await page.evaluate(
    ({ storageKey, stored }) => {
      sessionStorage.setItem(storageKey, JSON.stringify(stored));
    },
    { storageKey: 'atg.admin.session', stored: session },
  );
}

async function auditPage(page: Page, path: string, label: string): Promise<Finding[]> {
  await page.goto(`${ADMIN}${path}`, { waitUntil: 'domcontentloaded', timeout: 120_000 });
  await page.waitForTimeout(1500);
  const expression = `(${AUDIT_SOURCE})(${JSON.stringify({ pageLabel: label })})`;
  return page.evaluate(expression) as Promise<Finding[]>;
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const findings: Finding[] = [];

  const browser = await chromium.launch({ headless: true });

  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    findings.push(...(await auditPage(page, '/login', 'login')));
    await page.screenshot({ path: resolve(OUT, 'p5-6-login.png'), fullPage: false });
    await context.close();
  }

  const session = await loginSession();
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await applySession(page, session);

  for (const [path, label] of [
    ['/dashboard', 'dashboard'],
    ['/reservations', 'reservations'],
    ['/hebergements', 'hebergements'],
    ['/parametres', 'parametres'],
  ] as const) {
    findings.push(...(await auditPage(page, path, label)));
    await page.screenshot({ path: resolve(OUT, `p5-6-${label}.png`), fullPage: false });
  }

  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`${ADMIN}/reservations`, { waitUntil: 'domcontentloaded', timeout: 120_000 });
  await page.waitForTimeout(1500);
  const expand = page.locator('table button[aria-expanded]').first();
  if (await expand.count()) await expand.click();
  await page.screenshot({ path: resolve(OUT, 'p5-6-reservations-375.png'), fullPage: false });

  await page.goto(`${ADMIN}/hebergements`, { waitUntil: 'domcontentloaded', timeout: 120_000 });
  await page.waitForTimeout(1500);
  const tableToggle = page.getByRole('button', { name: /tableau|table|lista/i });
  if (await tableToggle.count()) await tableToggle.first().click();
  const expandProp = page.locator('table button[aria-expanded]').first();
  if (await expandProp.count()) await expandProp.click();
  await page.screenshot({ path: resolve(OUT, 'p5-6-hebergements-375.png'), fullPage: false });

  await browser.close();

  const report = {
    generatedAt: new Date().toISOString(),
    findings,
    errors: findings.filter((f) => f.severity === 'error'),
    warns: findings.filter((f) => f.severity === 'warn'),
  };
  writeFileSync(resolve(OUT, 'p5-6-a11y-report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));

  if (report.errors.length > 0) {
    console.error(`P5-6: ${report.errors.length} erreur(s) a11y`);
    process.exitCode = 2;
  } else {
    console.log(`P5-6 OK — ${report.warns.length} warning(s), captures dans ${OUT}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
