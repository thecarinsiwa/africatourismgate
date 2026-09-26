import { expect, test } from '@playwright/test';
import { loginAsSeedAdmin } from './helpers/admin-auth';
import {
  ENTRIES_SEARCH_ARIA,
  ENTRIES_TABLE_ARIA,
  TREASURY_DETAIL_HEADING,
  TREASURY_NEW_ENTRY_BUTTON,
  TREASURY_SUBMIT_CREATE,
  TREASURY_VIEW_ACTION,
  fillFundEntryCreateForm,
  navigateToTreasuryEntriesViaNav,
  uniqueFundEntryReference,
  waitForPageIdle,
} from './helpers/treasury-e2e';

/**
 * TRESO-042 — smoke happy path entrées de fonds.
 * Données isolées via référence unique `E2E-TRESO-*`.
 */
test.describe('Trésorerie — smoke entrées de fonds', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await loginAsSeedAdmin(page);
  });

  test('login → nav → créer entrée → liste → détail', async ({ page }) => {
    const reference = uniqueFundEntryReference();

    await navigateToTreasuryEntriesViaNav(page);

    await page.getByRole('link', { name: TREASURY_NEW_ENTRY_BUTTON }).click();
    await expect(page).toHaveURL(/\/tresorerie\/entrees\/nouveau\/?$/, {
      timeout: 30_000,
    });
    await waitForPageIdle(page);

    await fillFundEntryCreateForm(page, { reference });
    await page.getByRole('button', { name: TREASURY_SUBMIT_CREATE }).click();

    await expect(page).toHaveURL(/\/tresorerie\/entrees\/[0-9a-f-]{36}\/?$/i, {
      timeout: 60_000,
    });
    const editUrl = page.url();
    const entryId = editUrl.match(
      /\/tresorerie\/entrees\/([0-9a-f-]{36})/i,
    )?.[1];
    expect(entryId).toBeTruthy();

    await page.goto('/tresorerie/entrees', { waitUntil: 'domcontentloaded' });
    await waitForPageIdle(page);

    const search = page.getByLabel(ENTRIES_SEARCH_ARIA);
    await search.fill(reference);
    await expect(
      page.getByRole('table', { name: ENTRIES_TABLE_ARIA }).getByText(reference),
    ).toBeVisible({ timeout: 30_000 });

    await page
      .getByRole('table', { name: ENTRIES_TABLE_ARIA })
      .getByRole('link', { name: TREASURY_VIEW_ACTION })
      .first()
      .click();

    await expect(page).toHaveURL(
      new RegExp(`/tresorerie/entrees/${entryId}/voir/?$`, 'i'),
      { timeout: 30_000 },
    );
    await waitForPageIdle(page);

    await expect(
      page.getByRole('heading', { name: TREASURY_DETAIL_HEADING }),
    ).toBeVisible();
    await expect(page.getByText(reference)).toBeVisible();
    await expect(page.getByText(/1[\s\u00a0]?500/)).toBeVisible();
  });

  test('hub /tresorerie accessible après login', async ({ page }) => {
    await page.goto('/tresorerie', { waitUntil: 'domcontentloaded' });
    await waitForPageIdle(page);
    await expect(page).toHaveURL(/\/tresorerie\/?$/);
    await expect(
      page.getByRole('heading', { name: /^Trésorerie$|^Treasury$|^Tesorería$/i }),
    ).toBeVisible();
  });
});
