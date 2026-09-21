import { expect, test } from '@playwright/test';
import { loginAsSeedAdmin } from './helpers/admin-auth';

const HELP_HUB_HEADING =
  /Centre d'aide|Help Center|Centro de ayuda/i;
const SEARCH_LABEL =
  /Rechercher dans l'aide|Search help|Buscar en la ayuda/i;
const CATEGORIES_HEADING =
  /Parcourir par thème|Browse by topic|Explorar por tema/i;
const POPULAR_HEADING =
  /Articles populaires|Popular articles|Artículos populares/i;
const GETTING_STARTED =
  /Prise en main|Getting started|Primeros pasos/i;
const DASHBOARD_ARTICLE =
  /Naviguer dans le dashboard|Navigate the dashboard|Navegar por el panel/i;
const RELATED_HEADING =
  /Articles liés|Related articles|Artículos relacionados/i;
const SEARCH_RESULTS_ARIA =
  /Résultats de recherche|Search results|Resultados de búsqueda/i;
const NO_RESULTS =
  /Aucun article|No articles match|Ningún artículo/i;
const NAV_HELP =
  /Centre d'aide|Help Center|Centro de ayuda/i;

test.describe('Admin help center', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsSeedAdmin(page);
  });

  test('shows help hub with search, categories and popular articles', async ({
    page,
  }) => {
    await page.goto('/aide');

    await expect(
      page.getByRole('heading', { name: HELP_HUB_HEADING, level: 1 }),
    ).toBeVisible();

    await expect(page.getByLabel(SEARCH_LABEL)).toBeVisible();

    await expect(
      page.getByRole('heading', { name: CATEGORIES_HEADING }),
    ).toBeVisible();

    await expect(
      page.getByRole('link', { name: GETTING_STARTED }),
    ).toBeVisible();

    await expect(
      page.getByRole('heading', { name: POPULAR_HEADING }),
    ).toBeVisible();

    await expect(
      page
        .locator('section')
        .filter({ has: page.getByRole('heading', { name: POPULAR_HEADING }) })
        .getByRole('link', { name: DASHBOARD_ARTICLE }),
    ).toBeVisible();
  });

  test('sidebar link opens the help hub', async ({ page }) => {
    await page.goto('/dashboard');

    await page.getByRole('link', { name: NAV_HELP }).click();

    await expect(page).toHaveURL(/\/aide\/?$/);
    await expect(
      page.getByRole('heading', { name: HELP_HUB_HEADING, level: 1 }),
    ).toBeVisible();
  });

  test('navigates from category to article', async ({ page }) => {
    await page.goto('/aide');

    await page.getByRole('link', { name: GETTING_STARTED }).click();
    await expect(page).toHaveURL(/\/aide\/prise-en-main\/?$/);

    await expect(
      page.getByRole('heading', { name: GETTING_STARTED, level: 1 }),
    ).toBeVisible();

    await page.getByRole('link', { name: DASHBOARD_ARTICLE }).click();
    await expect(page).toHaveURL(
      /\/aide\/prise-en-main\/naviguer-dans-le-dashboard\/?$/,
    );

    await expect(
      page.getByRole('heading', { name: DASHBOARD_ARTICLE, level: 1 }),
    ).toBeVisible();

    await expect(
      page.getByRole('heading', { name: RELATED_HEADING }),
    ).toBeVisible();
  });

  test('search finds and opens an article', async ({ page }) => {
    await page.goto('/aide');

    const search = page.getByLabel(SEARCH_LABEL);
    await search.fill('palette');

    const results = page.getByRole('listbox', { name: SEARCH_RESULTS_ARIA });
    await expect(results).toBeVisible();

    await results
      .getByRole('option')
      .filter({
        hasText:
          /Palette de commandes|Command palette|Paleta de comandos/i,
      })
      .first()
      .click();

    await expect(page).toHaveURL(
      /\/aide\/prise-en-main\/palette-commandes\/?$/,
    );
    await expect(
      page.getByRole('heading', {
        name: /Palette de commandes|Command palette|Paleta de comandos/i,
        level: 1,
      }),
    ).toBeVisible();
  });

  test('empty search shows no-results message', async ({ page }) => {
    await page.goto('/aide');

    const search = page.getByLabel(SEARCH_LABEL);
    await search.fill('zzzz-no-match-xyz');

    const results = page.getByRole('listbox', { name: SEARCH_RESULTS_ARIA });
    await expect(results).toBeVisible();
    await expect(results.getByText(NO_RESULTS)).toBeVisible();
  });

  test('invalid category slug shows not found', async ({ page }) => {
    await page.goto('/aide/categorie-inconnue');

    await expect(page).toHaveURL(/\/aide\/categorie-inconnue/);
    await expect(
      page.getByRole('heading', {
        name: /introuvable|not found|no encontrad/i,
      }),
    ).toBeVisible();
  });

  test('invalid article path shows not found', async ({ page }) => {
    await page.goto('/aide/prise-en-main/article-inexistant');

    await expect(page).toHaveURL(/\/aide\/prise-en-main\/article-inexistant/);
    await expect(
      page.getByRole('heading', {
        name: /introuvable|not found|no encontrad/i,
      }),
    ).toBeVisible();
  });

  test('hub stays usable on a mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/aide');

    await expect(
      page.getByRole('heading', { name: HELP_HUB_HEADING, level: 1 }),
    ).toBeVisible();
    await expect(page.getByLabel(SEARCH_LABEL)).toBeVisible();
    await expect(
      page.getByRole('link', { name: GETTING_STARTED }),
    ).toBeVisible();
  });
});

const LANGUAGE_BUTTON = /Choisir la langue|Select language|Elegir idioma/i;

async function selectLocale(
  page: import('@playwright/test').Page,
  localeName: RegExp,
) {
  await page.getByRole('button', { name: LANGUAGE_BUTTON }).click();
  await expect(page.getByRole('menu', { name: LANGUAGE_BUTTON })).toBeVisible();
  await page.getByRole('menuitemradio', { name: localeName }).click();
}

test.describe('Admin help center — locale smoke', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await loginAsSeedAdmin(page);
  });

  test('hub and article render in English', async ({ page }) => {
    await selectLocale(page, /English/i);
    await page.goto('/aide');

    await expect(
      page.getByRole('heading', { name: 'Help Center', level: 1 }),
    ).toBeVisible();
    await expect(page.getByLabel('Search help')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Browse by topic' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /Getting started/i }),
    ).toBeVisible();

    await page.goto('/aide/prise-en-main/palette-commandes');
    await expect(
      page.getByRole('heading', {
        name: /Command palette/i,
        level: 1,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Related articles' }),
    ).toBeVisible();
  });

  test('hub and article render in Spanish', async ({ page }) => {
    await selectLocale(page, /Español/i);
    await page.goto('/aide');

    await expect(
      page.getByRole('heading', { name: 'Centro de ayuda', level: 1 }),
    ).toBeVisible();
    await expect(page.getByLabel('Buscar en la ayuda')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Explorar por tema' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /Primeros pasos/i }),
    ).toBeVisible();

    await page.goto('/aide/prise-en-main/palette-commandes');
    await expect(
      page.getByRole('heading', {
        name: /Paleta de comandos/i,
        level: 1,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Artículos relacionados' }),
    ).toBeVisible();
  });

  test('hub renders in French after switching back', async ({ page }) => {
    await selectLocale(page, /Français/i);
    await page.goto('/aide');

    await expect(
      page.getByRole('heading', { name: "Centre d'aide", level: 1 }),
    ).toBeVisible();
    await expect(page.getByLabel("Rechercher dans l'aide")).toBeVisible();
    await expect(
      page.getByRole('link', { name: /Prise en main/i }),
    ).toBeVisible();
  });
});
