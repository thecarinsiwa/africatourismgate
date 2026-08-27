import { expect, test } from '@playwright/test';
import { posHomeConfig } from '../../config/home';
import { posLoginFormConfig } from '../../config/login';
import { posSelectOrgPageConfig } from '../../config/select-org';
import {
  clearPosOrganization,
  selectOrganization,
} from './helpers/pos-auth';
import { SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, SEED_ORG_ATG_NAME } from './helpers/pos-seed.constants';

test.describe('Authentification POS', () => {
  test('login employé → select-org → accueil', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Connexion employé' })).toBeVisible();

    await page.getByLabel(posLoginFormConfig.email.label).fill(SEED_ADMIN_EMAIL);
    await page.locator('#password').fill(SEED_ADMIN_PASSWORD);
    await page.getByRole('button', { name: posLoginFormConfig.submit.label }).click();

    await page.waitForURL(/\/(select-org|\/?$)/, { timeout: 60_000 });

    if (!page.url().includes('/select-org')) {
      await clearPosOrganization(page);
      await page.goto('/select-org');
    }

    await expect(page.getByRole('heading', { name: posSelectOrgPageConfig.title })).toBeVisible();
    await selectOrganization(page, SEED_ORG_ATG_NAME);

    await expect(page.locator('main')).toContainText(posHomeConfig.actions.sale.label);
    await expect(page.locator('main')).toContainText(posHomeConfig.actions.history.label);
  });
});
