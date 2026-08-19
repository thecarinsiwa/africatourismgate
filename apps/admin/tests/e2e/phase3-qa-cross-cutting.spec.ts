import { expect, test } from '@playwright/test';
import { loginAsSeedAdmin } from './helpers/admin-auth';
import {
  LOYALTY_HISTORY_TITLE,
  NOTIFICATIONS_REGION,
  ORGANIZATION_TABS_ARIA,
  REVIEW_MODERATION_REGION,
  SEED_ORGANIZATION_ID,
  expectDrawerFocusTrapAndEscape,
  expectTabularNumsVisible,
  expectTabsKeyboardNavigation,
  gotoFirstReviewDetail,
  waitForPageIdle,
} from './helpers/phase3-qa';

const GUIDES_HEADING = /^Guides touristiques$|^Tour guides$|^Guías turísticos$/i;

test.describe('Phase 3 QA — 6 routes clés', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsSeedAdmin(page);
  });

  test('/organisations — colonne Effectifs en tabular-nums', async ({ page }) => {
    await page.goto('/organisations');
    await waitForPageIdle(page);

    const table = page.getByRole('table', { name: /Liste des organisations|Organizations list|Lista de organizaciones/i });
    await expect(table).toBeVisible();
    await expectTabularNumsVisible(table);
  });

  test('/organisations/[id] — Tabs clavier (ArrowRight)', async ({ page }) => {
    await page.goto(`/organisations/${SEED_ORGANIZATION_ID}`);
    await waitForPageIdle(page);

    const tablist = page.getByRole('tablist', { name: ORGANIZATION_TABS_ARIA });
    await expect(tablist).toBeVisible();

    await expectTabsKeyboardNavigation(
      page,
      tablist,
      /Utilisateurs|Users|Usuarios/i,
    );
  });

  test('/guides — StatCards en tabular-nums', async ({ page }) => {
    await page.goto('/guides');
    await waitForPageIdle(page);

    await expect(page.getByRole('heading', { name: GUIDES_HEADING }).first()).toBeVisible();
    await expectTabularNumsVisible(page.locator('main'));
  });

  test('/fidelite/comptes — Drawer historique : focus trap + Escape', async ({ page }) => {
    await page.goto('/fidelite/comptes');
    await waitForPageIdle(page);

    const historyButton = page.getByRole('button', { name: /Historique|History|Historial/i }).first();
    test.skip((await historyButton.count()) === 0, 'Aucun compte fidélité en seed');

    await expectDrawerFocusTrapAndEscape(page, async () => {
      await historyButton.click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByRole('heading', { name: LOYALTY_HISTORY_TITLE })).toBeVisible();
    });
  });

  test('/utilisateurs/employes — StatCards et codes en tabular-nums', async ({ page }) => {
    await page.goto('/utilisateurs/employes');
    await waitForPageIdle(page);

    await expectTabularNumsVisible(page.locator('main'));

    const table = page.getByRole('table');
    if ((await table.count()) > 0) {
      await expect(table.locator('.tabular-nums').first()).toBeVisible();
    }
  });

  test('/contenu/hero — StatCards en tabular-nums', async ({ page }) => {
    await page.goto('/contenu/hero');
    await waitForPageIdle(page);

    await expectTabularNumsVisible(page.locator('main'));
  });

  test('/contenu/avis/[id] — barre modération sticky + toasts accessibles', async ({ page }) => {
    const hasReview = await gotoFirstReviewDetail(page);
    test.skip(!hasReview, 'Aucun avis en seed');

    const moderationBar = page.getByRole('region', { name: REVIEW_MODERATION_REGION });
    await expect(moderationBar).toBeVisible();

    const approveButton = moderationBar.getByRole('button', {
      name: /Approuver|Approve|Aprobar/i,
    });
    if ((await approveButton.count()) === 0) {
      test.skip(true, 'Avis déjà modéré ou permissions insuffisantes');
    }

    await approveButton.click();
    await expect(page.getByRole('status').first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByLabel(NOTIFICATIONS_REGION)).toBeVisible();
  });
});
