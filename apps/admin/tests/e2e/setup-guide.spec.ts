import { expect, test } from '@playwright/test';
import { loginAsSeedAdmin } from './helpers/admin-auth';

const PAGE_HEADING =
  /Mise en route|Getting started|Puesta en marcha/i;
const MODULE_DESTINATIONS =
  /^(Destinations|Destinos)$/;
const OPEN_LIST =
  /Ouvrir la liste|Open list|Abrir lista/i;

test.describe('Admin setup guide (mise en route)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsSeedAdmin(page);
  });

  test('nav → Destinations module → deep-link to destinations list', async ({
    page,
  }) => {
    await page.goto('/dashboard');

    await page.locator('a[href="/mise-en-route"]').first().click();
    await expect(page).toHaveURL(/\/mise-en-route\/?$/);

    const guide = page.getByTestId('setup-guide-page');
    await expect(guide).toBeVisible();
    await expect(
      page.getByRole('heading', { name: PAGE_HEADING, level: 1 }),
    ).toBeVisible();

    const moduleNav = page.getByTestId('setup-module-nav');
    await expect(moduleNav).toBeVisible();

    await moduleNav.locator('[data-module-id="destinations"]').click();
    await expect(
      moduleNav.locator('[data-module-id="destinations"]'),
    ).toHaveAttribute('aria-current', 'true');

    await expect(
      guide.getByRole('heading', { name: MODULE_DESTINATIONS, level: 2 }),
    ).toBeVisible();

    const destinationsStep = guide.locator(
      '[data-testid="setup-step-card"][data-step-id="destinations"]',
    );
    await expect(destinationsStep).toBeVisible();

    await destinationsStep.getByRole('link', { name: OPEN_LIST }).click();
    await expect(page).toHaveURL(/\/produits\/destinations\/?$/);
  });
});
