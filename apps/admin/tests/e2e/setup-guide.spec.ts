import { expect, test } from '@playwright/test';
import { loginAsSeedAdmin } from './helpers/admin-auth';

const NAV_SETUP_GUIDE =
  /Mise en route|Getting started|Puesta en marcha/i;
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
    // Desktop : la sidebar mobile (md:hidden) reste dans le DOM mais hors écran.
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/dashboard');

    // getByRole ne matche que les éléments visibles (évite le lien drawer mobile).
    await page.getByRole('link', { name: NAV_SETUP_GUIDE }).click();
    await expect(page).toHaveURL(/\/mise-en-route\/?$/);

    const guide = page.getByTestId('setup-guide-page');
    await expect(guide).toBeVisible();
    await expect(
      page.getByRole('heading', { name: PAGE_HEADING, level: 1 }),
    ).toBeVisible();

    const moduleNav = page.getByTestId('setup-module-nav');
    await expect(moduleNav).toBeVisible();

    // Attendre la fin du 1er fetch readiness (bouton Actualiser actif).
    await expect(page.getByTestId('setup-guide-refresh')).toBeEnabled({
      timeout: 60_000,
    });

    const destinationsModule = moduleNav.locator(
      '[data-module-id="destinations"]',
    );
    // Module souvent encore verrouillé (prérequis platform) — sélection autorisée.
    await expect(destinationsModule).toBeVisible();
    await destinationsModule.click();
    await expect(destinationsModule).toHaveAttribute('aria-current', 'true');

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
