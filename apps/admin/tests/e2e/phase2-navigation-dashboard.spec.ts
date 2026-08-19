import { expect, test } from '@playwright/test';
import { loginAsSeedAdmin } from './helpers/admin-auth';

const BREADCRUMB_LABEL = /Fil d'Ariane|Breadcrumb|Miga de pan/i;
const PERIOD_TABLIST_LABEL = /Période|Period|Período/i;
const CHART_ARIA_LABEL =
  /Graphique des réservations et revenus par jour|Bookings and revenue chart by day|Gráfico de reservas e ingresos por día/i;
const CHART_EMPTY =
  /Aucune donnée sur cette période|No data for this period|Sin datos en este período/i;

async function waitForDashboardChartSection(page: import('@playwright/test').Page) {
  const chartOrEmpty = page
    .getByRole('img', { name: CHART_ARIA_LABEL })
    .or(page.getByText(CHART_EMPTY));
  await expect(chartOrEmpty).toBeVisible({ timeout: 30_000 });
}

async function waitForDashboardDataIdle(page: import('@playwright/test').Page) {
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0, { timeout: 30_000 });
}

test.describe('Phase 2 — Dashboard periods', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsSeedAdmin(page);
    await page.goto('/dashboard');
    await expect(page.getByRole('tablist', { name: PERIOD_TABLIST_LABEL })).toBeVisible();
  });

  test('defaults to 30-day period', async ({ page }) => {
    const tablist = page.getByRole('tablist', { name: PERIOD_TABLIST_LABEL });
    await expect(tablist.getByRole('tab', { name: '30 jours' })).toHaveAttribute('aria-selected', 'true');
    await expect(tablist.getByRole('tab', { name: '7 jours' })).toHaveAttribute('aria-selected', 'false');
    await expect(tablist.getByRole('tab', { name: '90 jours' })).toHaveAttribute('aria-selected', 'false');
  });

  test('switching period updates tabs and reloads chart data', async ({ page }) => {
    await waitForDashboardChartSection(page);

    const tablist = page.getByRole('tablist', { name: PERIOD_TABLIST_LABEL });
    await tablist.getByRole('tab', { name: '7 jours' }).click();

    await expect(tablist.getByRole('tab', { name: '7 jours' })).toHaveAttribute('aria-selected', 'true');
    await expect(tablist.getByRole('tab', { name: '30 jours' })).toHaveAttribute('aria-selected', 'false');

    await waitForDashboardDataIdle(page);
    await waitForDashboardChartSection(page);

    await tablist.getByRole('tab', { name: '90 jours' }).click();
    await expect(tablist.getByRole('tab', { name: '90 jours' })).toHaveAttribute('aria-selected', 'true');
    await waitForDashboardDataIdle(page);
    await waitForDashboardChartSection(page);
  });
});

test.describe('Phase 2 — Breadcrumb navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsSeedAdmin(page);
  });

  test('dashboard root hides breadcrumb', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('navigation', { name: BREADCRUMB_LABEL })).toHaveCount(0);
  });

  test('desktop shows full breadcrumb trail on nested route', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/utilisateurs/employes/nouveau');

    const breadcrumb = page.getByRole('navigation', { name: BREADCRUMB_LABEL });
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb.getByRole('link', { name: 'Utilisateurs' })).toBeVisible();
    await expect(breadcrumb.getByRole('link', { name: 'Employés' })).toBeVisible();
    await expect(breadcrumb.getByText('Nouvel employé')).toBeVisible();
    await expect(breadcrumb.locator('text=…')).toBeHidden();
  });

  test('mobile collapses middle breadcrumb segments with ellipsis', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/utilisateurs/employes/nouveau');

    const breadcrumb = page.getByRole('navigation', { name: BREADCRUMB_LABEL });
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb.getByRole('link', { name: 'Utilisateurs' })).toBeVisible();
    await expect(breadcrumb.getByText('Nouvel employé')).toBeVisible();
    await expect(breadcrumb.getByRole('link', { name: 'Employés' })).toBeHidden();
    await expect(breadcrumb.locator('text=…')).toBeVisible();
  });

  test('breadcrumb parent link navigates on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/utilisateurs/employes/nouveau');

    await page
      .getByRole('navigation', { name: BREADCRUMB_LABEL })
      .getByRole('link', { name: 'Utilisateurs' })
      .click();

    await expect(page).toHaveURL(/\/utilisateurs$/, { timeout: 15_000 });
    await expect(page.getByRole('heading', { name: 'Utilisateurs', exact: true }).first()).toBeVisible();
  });

  test('mobile sidebar navigation shows breadcrumb on nested list page', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');

    await page.getByRole('button', { name: 'Ouvrir le menu' }).click();
    await page.getByRole('button', { name: 'Utilisateurs et authentification' }).click();
    await page.getByRole('link', { name: 'Employés', exact: true }).click();

    await expect(page).toHaveURL(/\/utilisateurs\/employes$/, { timeout: 15_000 });

    const breadcrumb = page.getByRole('navigation', { name: BREADCRUMB_LABEL });
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb.getByRole('link', { name: 'Utilisateurs' })).toBeVisible();
    await expect(breadcrumb.getByText('Employés')).toBeVisible();
  });
});
