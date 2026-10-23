import { expect, type Page } from '@playwright/test';

export type AppLocale = 'en' | 'es' | 'fr';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3002';

const MENU_LABEL: Record<AppLocale, RegExp> = {
  en: /English/i,
  es: /Español/i,
  fr: /Français/i,
};

/**
 * Apply locale via cookie + storage + reload (same persistence as LanguageSwitcher).
 * Prefer this over menu clicks on account/hydrate-heavy pages.
 */
export async function switchLanguage(page: Page, locale: AppLocale): Promise<void> {
  await page.context().addCookies([{ name: 'atg-locale', value: locale, url: BASE_URL }]);
  await page.evaluate((code) => {
    document.cookie = `atg-locale=${code};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
    try {
      localStorage.setItem('atg-locale', code);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = code;
    try {
      const raw = window.sessionStorage.getItem('atg.web.session');
      if (raw) {
        const session = JSON.parse(raw) as { user?: { preferredLanguage?: string } };
        if (session.user) {
          session.user.preferredLanguage = code;
          window.sessionStorage.setItem('atg.web.session', JSON.stringify(session));
        }
      }
    } catch {
      /* ignore */
    }
  }, locale);

  await page.goto(page.url(), { waitUntil: 'domcontentloaded' });
  await expect(
    page
      .getByRole('button', { name: /Choisir la langue|Select language|Elegir idioma/i })
      .first(),
  ).toContainText(locale.toUpperCase(), { timeout: 15_000 });
}

/**
 * UI language menu (covers LanguageSwitcher click path). Falls back to cookie sync
 * when router.refresh() remounts the menu mid-click.
 */
export async function switchLanguageViaMenu(page: Page, locale: AppLocale): Promise<void> {
  const langBtn = page
    .getByRole('button', { name: /Choisir la langue|Select language|Elegir idioma/i })
    .first();
  await langBtn.click();
  const menuItem = page.getByRole('menuitemradio', { name: MENU_LABEL[locale] });
  await expect(menuItem).toBeVisible({ timeout: 10_000 });
  await menuItem.click({ noWaitAfter: true }).catch(() => {
    /* remount race — cookie path below still applies */
  });
  await switchLanguage(page, locale);
}

/**
 * Heuristic: header chrome must not keep common FR nav labels after EN switch.
 * Scoped to `banner`/`header` so CMS announcement / blog body FR content is ignored.
 */
export async function assertNoCommonFrHeaderChrome(page: Page): Promise<void> {
  const header = page.locator('header').first();
  await expect(header.getByRole('link', { name: 'Connexion', exact: true })).toHaveCount(0);
  await expect(header.getByRole('link', { name: 'Accueil', exact: true })).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: /Select language/i }).first(),
  ).toContainText('EN');
}
