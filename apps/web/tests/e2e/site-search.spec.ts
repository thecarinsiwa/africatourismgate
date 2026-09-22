import { expect, test } from '@playwright/test';

const SEARCH_TITLE = /Rechercher sur le site|Search the site|Buscar en el sitio/i;
const OPEN_SEARCH = /Ouvrir la recherche|Open search|Abrir la búsqueda/i;
const RESULTS_HEADING = /Résultats|Results|Resultados/i;

test.describe('Site global search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('opens from header loupe and shows page results', async ({ page }) => {
    const trigger = page.getByTestId('site-search-trigger').first();
    await expect(trigger).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByTestId('site-search-navigator')).toBeVisible();
    await expect(page.getByRole('dialog', { name: SEARCH_TITLE })).toBeVisible();

    const input = page.getByTestId('site-search-input');
    await expect(input).toBeFocused();

    await input.fill('blog');
    await expect(page.getByTestId('site-search-result').first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test('opens with Ctrl+K and navigates to a page', async ({ page }) => {
    await page.keyboard.press('ControlOrMeta+k');
    await expect(page.getByTestId('site-search-navigator')).toBeVisible();

    const input = page.getByTestId('site-search-input');
    await input.fill('blog');
    const first = page.getByTestId('site-search-result').first();
    await expect(first).toBeVisible({ timeout: 10_000 });
    await first.click();

    await expect(page).toHaveURL(/\/blog/);
    await expect(page.getByTestId('site-search-navigator')).toHaveCount(0);
  });

  test('Ctrl+K toggles and keyboard navigates with Enter', async ({ page }) => {
    await page.keyboard.press('ControlOrMeta+k');
    await expect(page.getByTestId('site-search-navigator')).toBeVisible();
    await expect(page.getByLabel(OPEN_SEARCH).first()).toHaveAttribute(
      'aria-expanded',
      'true',
    );

    const input = page.getByTestId('site-search-input');
    await input.fill('blog');
    await expect(page.getByTestId('site-search-result').first()).toBeVisible({
      timeout: 10_000,
    });

    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/blog/);

    await page.goto('/');
    await page.keyboard.press('ControlOrMeta+k');
    await expect(page.getByTestId('site-search-navigator')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('site-search-navigator')).toHaveCount(0);
  });

  test('results page /search?q= shows grouped results', async ({ page }) => {
    await page.goto('/search?q=blog');

    await expect(
      page.getByRole('heading', { name: RESULTS_HEADING, level: 1 }),
    ).toBeVisible({ timeout: 15_000 });

    await expect(page.getByTestId('site-search-page-result').first()).toBeVisible(
      {
        timeout: 15_000,
      },
    );
    await expect(page.getByTestId('site-search-page-count')).toBeVisible();
  });
});
