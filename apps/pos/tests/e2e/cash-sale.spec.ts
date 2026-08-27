import { expect, test } from '@playwright/test';
import { posSaleSuccessPageConfig } from '../../config/sale';
import { loginAsPosEmployee } from './helpers/pos-auth';
import { completeCashRoomSale } from './helpers/sale-flow';

test.describe('Vente cash POS', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsPosEmployee(page);
  });

  test('vente espèces bout-en-bout → success + reçu visible', async ({ page }) => {
    await completeCashRoomSale(page);

    await expect(page.getByRole('heading', { name: posSaleSuccessPageConfig.title })).toBeVisible();
    await expect(page.getByLabel('Reçu de vente')).toBeVisible();
    await expect(page.getByRole('heading', { name: posSaleSuccessPageConfig.receiptTitle })).toBeVisible();
    await expect(page.getByRole('button', { name: posSaleSuccessPageConfig.printReceiptLabel })).toBeVisible();
    await expect(page.getByRole('button', { name: posSaleSuccessPageConfig.downloadPdfLabel })).toBeVisible();
  });
});
