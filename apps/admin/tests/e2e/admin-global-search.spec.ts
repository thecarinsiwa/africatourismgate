import { expect, test } from '@playwright/test';
import { loginAsSeedAdmin } from './helpers/admin-auth';

const SEARCH_TITLE = /Recherche admin|Admin search|Búsqueda admin/i;
const OPEN_SEARCH = /Ouvrir la recherche|Open search|Abrir la búsqueda/i;

test.describe('Admin global search', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsSeedAdmin(page);
    await page.goto('/dashboard');
  });

  test('opens from header loupe and shows page results', async ({ page }) => {
    const trigger = page.getByTestId('admin-search-trigger');
    await expect(trigger).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByTestId('admin-search-navigator')).toBeVisible();
    await expect(page.getByRole('dialog', { name: SEARCH_TITLE })).toBeVisible();

    const input = page.getByTestId('admin-search-input');
    await expect(input).toBeFocused();

    await input.fill('dashboard');
    await expect(page.getByTestId('admin-search-result').first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test('opens with Ctrl+F and navigates to a page', async ({ page }) => {
    await page.keyboard.press('ControlOrMeta+f');
    await expect(page.getByTestId('admin-search-navigator')).toBeVisible();

    const input = page.getByTestId('admin-search-input');
    await input.fill('aide');
    const first = page.getByTestId('admin-search-result').first();
    await expect(first).toBeVisible({ timeout: 10_000 });
    await first.click();

    await expect(page).toHaveURL(/\/aide/);
    await expect(page.getByTestId('admin-search-navigator')).toHaveCount(0);
  });

  test('Ctrl+K alias toggles the same navigator', async ({ page }) => {
    await page.keyboard.press('ControlOrMeta+k');
    await expect(page.getByTestId('admin-search-navigator')).toBeVisible();
    await expect(page.getByLabel(OPEN_SEARCH)).toHaveAttribute(
      'aria-expanded',
      'true',
    );

    await page.keyboard.press('Escape');
    await expect(page.getByTestId('admin-search-navigator')).toHaveCount(0);
  });
});
