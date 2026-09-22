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
const QUICK_START_HEADING =
  /Démarrage rapide|Quick start|Inicio rápido/i;
const GETTING_STARTED =
  /Prise en main|Getting started|Primeros pasos/i;
const DASHBOARD_ARTICLE =
  /Naviguer dans le dashboard|Navigate the dashboard|Navegar por el panel/i;
const BOOKINGS_ARTICLE =
  /Gérer les réservations|Manage bookings|Gestionar reservas/i;
const USERS_ARTICLE =
  /Gérer les utilisateurs|Manage users|Gestionar usuarios/i;
const USERS_MODULE_LINK = /^(Utilisateurs|Users|Usuarios)$/;
const RELATED_HEADING =
  /Articles liés|Related articles|Artículos relacionados/i;
const SEARCH_RESULTS_ARIA =
  /Résultats de recherche|Search results|Resultados de búsqueda/i;
const SEARCH_SUGGESTIONS_ARIA =
  /Suggestions d'articles populaires|Popular article suggestions|Sugerencias de artículos populares/i;
const NO_RESULTS =
  /Aucun article|No articles match|Ningún artículo/i;
const NO_RESULTS_HINT =
  /démarrage rapide|quick-start|inicio rápido/i;
const NAV_HELP =
  /Centre d'aide|Help Center|Centro de ayuda/i;
const CONTEXTUAL_HELP_ARIA =
  /Aide pour cette page|Open help for this page|Ayuda para esta página|Ouvrir l'aide pour cette page|Abrir la ayuda para esta página/i;
const HUB_HELP_ARIA =
  /Ouvrir le centre d'aide|Open the Help Center|Abrir el centro de ayuda/i;
const ARTICLE_COUNT =
  /\d+\s+(article|articles|artículo|artículos)/i;

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

  test('shows quick start links and opens an article', async ({ page }) => {
    await page.goto('/aide');

    const quickStart = page.locator('#admin-help-quick-start');
    await expect(
      page.getByRole('heading', { name: QUICK_START_HEADING }),
    ).toBeVisible();
    await expect(
      quickStart.getByRole('link', { name: DASHBOARD_ARTICLE }),
    ).toBeVisible();

    await quickStart.getByRole('link', { name: DASHBOARD_ARTICLE }).click();
    await expect(page).toHaveURL(
      /\/aide\/prise-en-main\/naviguer-dans-le-dashboard\/?$/,
    );
    await expect(
      page.getByRole('heading', { name: DASHBOARD_ARTICLE, level: 1 }),
    ).toBeVisible();
  });

  test('category tiles show article counts', async ({ page }) => {
    await page.goto('/aide');

    const categories = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: CATEGORIES_HEADING }) });

    await expect(categories.getByText(ARTICLE_COUNT).first()).toBeVisible();
  });

  test('sidebar link opens the help hub', async ({ page }) => {
    await page.goto('/dashboard');

    await page.getByRole('link', { name: NAV_HELP }).click();

    await expect(page).toHaveURL(/\/aide\/?$/);
    await expect(
      page.getByRole('heading', { name: HELP_HUB_HEADING, level: 1 }),
    ).toBeVisible();
  });

  test('shell contextual help opens the mapped article', async ({ page }) => {
    await page.goto('/reservations');

    const helpLink = page.getByTestId('admin-contextual-help-link');
    await expect(helpLink).toBeVisible();
    await expect(helpLink).toHaveAttribute('data-contextual', 'true');
    await expect(helpLink).toHaveAttribute('aria-label', CONTEXTUAL_HELP_ARIA);

    await helpLink.click();
    await expect(page).toHaveURL(
      /\/aide\/reservations-guides\/gerer-les-reservations\/?$/,
    );
    await expect(
      page.getByRole('heading', { name: BOOKINGS_ARTICLE, level: 1 }),
    ).toBeVisible();
  });

  test('shell help on hub points to the help center', async ({ page }) => {
    await page.goto('/aide');

    const helpLink = page.getByTestId('admin-contextual-help-link');
    await expect(helpLink).toHaveAttribute('data-contextual', 'false');
    await expect(helpLink).toHaveAttribute('aria-label', HUB_HELP_ARIA);
    await expect(helpLink).toHaveAttribute('href', /\/aide\/?$/);
  });

  test('navigates from category to article', async ({ page }) => {
    await page.goto('/aide');

    await page.getByRole('link', { name: GETTING_STARTED }).click();
    await expect(page).toHaveURL(/\/aide\/prise-en-main\/?$/);

    await expect(
      page.getByRole('heading', { name: GETTING_STARTED, level: 1 }),
    ).toBeVisible();
    await expect(page.getByText(ARTICLE_COUNT).first()).toBeVisible();

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

  test('focus on empty search shows popular suggestions', async ({ page }) => {
    await page.goto('/aide');

    const search = page.getByLabel(SEARCH_LABEL);
    await search.click();

    const suggestions = page.getByRole('listbox', {
      name: SEARCH_SUGGESTIONS_ARIA,
    });
    await expect(suggestions).toBeVisible();
    await expect(
      suggestions.getByRole('option', { name: DASHBOARD_ARTICLE }),
    ).toBeVisible();

    await suggestions
      .getByRole('option', { name: DASHBOARD_ARTICLE })
      .click();
    await expect(page).toHaveURL(
      /\/aide\/prise-en-main\/naviguer-dans-le-dashboard\/?$/,
    );
  });

  test('search finds and opens an article', async ({ page }) => {
    await page.goto('/aide');

    const search = page.getByLabel(SEARCH_LABEL);
    await search.fill('palette');

    const results = page.getByRole('listbox', { name: SEARCH_RESULTS_ARIA });
    await expect(results).toBeVisible();
    await expect(results.getByText(ARTICLE_COUNT)).toBeVisible();

    await results
      .getByRole('option')
      .filter({
        hasText:
          /Recherche admin|Admin search|Búsqueda admin/i,
      })
      .first()
      .click();

    await expect(page).toHaveURL(
      /\/aide\/prise-en-main\/palette-commandes\/?$/,
    );
    await expect(
      page.getByRole('heading', {
        name: /Recherche admin|Admin search|Búsqueda admin/i,
        level: 1,
      }),
    ).toBeVisible();
  });

  test('empty search shows no-results message and quick-start links', async ({
    page,
  }) => {
    await page.goto('/aide');

    const search = page.getByLabel(SEARCH_LABEL);
    await search.fill('zzzz-no-match-xyz');

    const results = page.getByRole('listbox', { name: SEARCH_RESULTS_ARIA });
    await expect(results).toBeVisible();
    await expect(results.getByText(NO_RESULTS)).toBeVisible();
    await expect(results.getByText(NO_RESULTS_HINT)).toBeVisible();
    await expect(
      results.getByRole('link', { name: DASHBOARD_ARTICLE }),
    ).toBeVisible();
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

  test('inline article link opens the admin module page', async ({ page }) => {
    await page.goto('/aide/utilisateurs-acces/gerer-les-utilisateurs');

    await expect(
      page.getByRole('heading', { name: USERS_ARTICLE, level: 1 }),
    ).toBeVisible();

    const moduleLink = page
      .locator('article')
      .getByRole('link', { name: USERS_MODULE_LINK })
      .first();
    await expect(moduleLink).toHaveAttribute('href', '/utilisateurs');
    await moduleLink.click();

    await expect(page).toHaveURL(/\/utilisateurs\/?$/);
  });

  test('hub stays usable on a mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/aide');

    await expect(
      page.getByRole('heading', { name: HELP_HUB_HEADING, level: 1 }),
    ).toBeVisible();
    await expect(page.getByLabel(SEARCH_LABEL)).toBeVisible();
    await expect(
      page.getByRole('heading', { name: QUICK_START_HEADING }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: GETTING_STARTED }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: POPULAR_HEADING }),
    ).toBeVisible();
    await expect(
      page.getByTestId('admin-contextual-help-link'),
    ).toBeVisible();

    const search = page.getByLabel(SEARCH_LABEL);
    await search.click();
    await expect(
      page.getByRole('listbox', { name: SEARCH_SUGGESTIONS_ARIA }),
    ).toBeVisible();
  });

  test('contextual help works on mobile from reservations', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/reservations');

    const helpLink = page.getByTestId('admin-contextual-help-link');
    await expect(helpLink).toHaveAttribute('data-contextual', 'true');
    await helpLink.click();

    await expect(page).toHaveURL(
      /\/aide\/reservations-guides\/gerer-les-reservations\/?$/,
    );
    await expect(
      page.getByRole('heading', { name: BOOKINGS_ARTICLE, level: 1 }),
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
      page.getByRole('heading', { name: 'Quick start' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /Getting started/i }),
    ).toBeVisible();

    await page.goto('/aide/prise-en-main/palette-commandes');
    await expect(
      page.getByRole('heading', {
        name: /Admin search/i,
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
      page.getByRole('heading', { name: 'Inicio rápido' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /Primeros pasos/i }),
    ).toBeVisible();

    await page.goto('/aide/prise-en-main/palette-commandes');
    await expect(
      page.getByRole('heading', {
        name: /Búsqueda admin/i,
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
      page.getByRole('heading', { name: 'Démarrage rapide' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /Prise en main/i }),
    ).toBeVisible();
  });
});
