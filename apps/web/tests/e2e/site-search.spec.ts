import { expect, test } from '@playwright/test';

const SEARCH_TITLE = /Rechercher sur le site|Search the site|Buscar en el sitio/i;
const OPEN_SEARCH = /Ouvrir la recherche|Open search|Abrir la búsqueda/i;
const RESULTS_HEADING = /Résultats|Results|Resultados/i;
/** Libellé nav de la page blog (source locale `pages`). */
const BLOG_OPTION = /Blog/i;

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
    // Attendre le debounce (300 ms) + filtre : ne pas cliquer un résultat de la requête vide.
    await expect(page.getByRole('option', { name: BLOG_OPTION }).first()).toBeVisible({
      timeout: 10_000,
    });
    await expect(
      page.getByRole('option', { name: /Accueil|Home|Inicio/i }),
    ).toHaveCount(0);
  });

  test('opens with Ctrl+K and navigates to a page', async ({ page }) => {
    await page.keyboard.press('ControlOrMeta+k');
    await expect(page.getByTestId('site-search-navigator')).toBeVisible();

    const input = page.getByTestId('site-search-input');
    await input.fill('blog');

    const blogResult = page.getByRole('option', { name: BLOG_OPTION }).first();
    await expect(blogResult).toBeVisible({ timeout: 10_000 });
    await expect(
      page.getByRole('option', { name: /Accueil|Home|Inicio/i }),
    ).toHaveCount(0);

    await blogResult.click();

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

    const blogResult = page.getByRole('option', { name: BLOG_OPTION }).first();
    await expect(blogResult).toBeVisible({ timeout: 10_000 });
    await expect(
      page.getByRole('option', { name: /Accueil|Home|Inicio/i }),
    ).toHaveCount(0);

    // Focus déjà sur l’input : Entrée active l’option sélectionnée (index 0 après filtre).
    await input.press('Enter');
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
