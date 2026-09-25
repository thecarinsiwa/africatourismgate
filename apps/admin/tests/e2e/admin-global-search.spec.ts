import { expect, test } from '@playwright/test';
import { loginAsSeedAdmin } from './helpers/admin-auth';

const SEARCH_TITLE = /Recherche admin|Admin search|Búsqueda admin/i;
const OPEN_SEARCH = /Ouvrir la recherche|Open search|Abrir la búsqueda/i;
const SUGGESTIONS = /Suggestions|Sugerencias/i;
const MIN_QUERY_HINT =
  /au moins 2 caractères|at least 2 characters|al menos 2 caracteres/i;
const EMPTY_HINT =
  /Essayez plutôt|Try these shortcuts|Pruebe estos atajos/i;
const QUICK_DASHBOARD = /Tableau de bord|Dashboard|Panel/i;
const QUICK_HELP = /Centre d'aide|Help centre|Centro de ayuda/i;
const QUICK_USERS = /Utilisateurs|Users|Usuarios/i;

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
    await expect(input).toHaveAttribute('role', 'combobox');
    await expect(input).toHaveAttribute('aria-expanded', 'true');
    await expect(input).toHaveAttribute('aria-autocomplete', 'list');

    await input.fill('dashboard');
    await expect(page.getByTestId('admin-search-result').first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test('shows suggestions when opened with an empty query', async ({ page }) => {
    await page.getByTestId('admin-search-trigger').click();
    await expect(page.getByTestId('admin-search-navigator')).toBeVisible();

    await expect(
      page.getByRole('listbox', {
        name: /Suggestions de pages|Page suggestions|Sugerencias de páginas/i,
      }),
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      page.getByRole('heading', { name: SUGGESTIONS, level: 3 }),
    ).toBeVisible();
    await expect(page.getByTestId('admin-search-result').first()).toBeVisible();
    await expect(page.getByTestId('admin-search-min-query-hint')).toHaveCount(0);
  });

  test('shows minQueryHint for a single character', async ({ page }) => {
    await page.keyboard.press('ControlOrMeta+f');
    const input = page.getByTestId('admin-search-input');
    await input.fill('a');

    await expect(page.getByTestId('admin-search-min-query-hint')).toBeVisible();
    await expect(page.getByTestId('admin-search-min-query-hint')).toHaveText(
      MIN_QUERY_HINT,
    );
  });

  test('empty state shows hint and quick links', async ({ page }) => {
    await page.keyboard.press('ControlOrMeta+f');
    const input = page.getByTestId('admin-search-input');
    await input.fill('zzzz-no-match-xyz-9f3a');

    const empty = page.getByTestId('admin-search-empty');
    await expect(empty).toBeVisible({ timeout: 15_000 });
    await expect(empty.getByText(EMPTY_HINT)).toBeVisible();
    await expect(empty.getByRole('button', { name: QUICK_DASHBOARD })).toBeVisible();
    await expect(empty.getByRole('button', { name: QUICK_HELP })).toBeVisible();
    await expect(empty.getByRole('button', { name: QUICK_USERS })).toBeVisible();

    await empty.getByRole('button', { name: QUICK_HELP }).click();
    await expect(page).toHaveURL(/\/aide\/?$/);
    await expect(page.getByTestId('admin-search-navigator')).toHaveCount(0);
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

  test('finds help article palette-commandes via search', async ({ page }) => {
    await page.keyboard.press('ControlOrMeta+f');
    const input = page.getByTestId('admin-search-input');
    await input.fill('palette');

    const result = page
      .getByTestId('admin-search-result')
      .filter({ hasText: SEARCH_TITLE })
      .first();
    await expect(result).toBeVisible({ timeout: 10_000 });
    await result.click();

    await expect(page).toHaveURL(
      /\/aide\/prise-en-main\/palette-commandes\/?$/,
    );
  });
});
