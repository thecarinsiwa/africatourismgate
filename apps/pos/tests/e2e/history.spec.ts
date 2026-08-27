import { expect, test } from '@playwright/test';
import { posHistoryPageConfig } from '../../config/history';
import { loginAsPosEmployee } from './helpers/pos-auth';
import { completeCashRoomSale } from './helpers/sale-flow';

test.describe('Historique ventes du jour', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsPosEmployee(page);
  });

  test('affiche la vente cash confirmée après encaissement', async ({ page }) => {
    await completeCashRoomSale(page);

    const bookingId = new URL(page.url()).searchParams.get('bookingId');
    expect(bookingId).toBeTruthy();
    const shortId = bookingId!.slice(0, 8).toUpperCase();

    await page.goto('/history');
    await expect(page.getByRole('heading', { name: posHistoryPageConfig.title })).toBeVisible();

    const saleCard = page.getByRole('button', { name: new RegExp(shortId) });
    await expect(saleCard).toBeVisible({ timeout: 30_000 });
    await expect(saleCard).toContainText(posHistoryPageConfig.statusLabels.confirmed);
    await expect(saleCard).toContainText(posHistoryPageConfig.paymentLabels.cash);
  });
});
