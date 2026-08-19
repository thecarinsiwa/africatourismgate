import { expect, type Locator, type Page } from '@playwright/test';

/** Seed default organization (Africa Tourism Gate). */
export const SEED_ORGANIZATION_ID = '00000000-0000-4000-8000-000000000001';

export const ORGANIZATION_TABS_ARIA =
  /Sections de l'organisation|Organization sections|Secciones de la organización/i;

export const LOYALTY_HISTORY_TITLE =
  /Historique des transactions|Transaction history|Historial de transacciones/i;

export const REVIEW_MODERATION_REGION =
  /Actions de modération|Moderation actions|Acciones de moderación/i;

export const NOTIFICATIONS_REGION = /Notifications/i;

export async function waitForPageIdle(page: Page) {
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0, { timeout: 30_000 });
}

export async function expectTabularNumsVisible(scope: Locator) {
  await expect(scope.locator('.tabular-nums').first()).toBeVisible({ timeout: 15_000 });
}

export async function expectTabsKeyboardNavigation(
  page: Page,
  tablist: Locator,
  nextTabName: RegExp,
) {
  const firstTab = tablist.getByRole('tab').first();
  await firstTab.focus();
  await expect(firstTab).toBeFocused();

  await page.keyboard.press('ArrowRight');
  const nextTab = tablist.getByRole('tab', { name: nextTabName });
  await expect(nextTab).toHaveAttribute('aria-selected', 'true');
  await expect(nextTab).toBeFocused();
}

export async function expectDrawerFocusTrapAndEscape(page: Page, openDrawer: () => Promise<void>) {
  await openDrawer();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  await page.keyboard.press('Tab');
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const panel = document.querySelector('[role="dialog"]');
        const active = document.activeElement;
        return Boolean(panel && active && panel.contains(active));
      }),
    )
    .toBe(true);

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
}

export async function gotoFirstReviewDetail(page: Page): Promise<boolean> {
  await page.goto('/contenu/avis');
  await waitForPageIdle(page);

  const table = page.getByRole('table');
  if ((await table.count()) === 0) {
    return false;
  }

  const firstRowLink = table.locator('tbody tr').first().getByRole('link');
  if ((await firstRowLink.count()) === 0) {
    return false;
  }

  await firstRowLink.click();
  await expect(page).toHaveURL(/\/contenu\/avis\/[^/]+$/, { timeout: 15_000 });
  await waitForPageIdle(page);
  return true;
}
