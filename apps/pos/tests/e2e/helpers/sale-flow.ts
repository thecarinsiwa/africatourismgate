import { expect, type Page } from '@playwright/test';
import { posSalePageConfig, posSaleSuccessPageConfig } from '../../../config/sale';
import { E2E_ROOM_STAY_START } from './pos-seed.constants';
import { ensurePosSaleSeedData } from './pos-seed';

const ROOM_CATALOG_TITLE = 'Standard Double';

function saleCartPanel(page: Page) {
  return page.getByRole('complementary').filter({
    has: page.getByRole('heading', { name: posSalePageConfig.cart.title }),
  });
}

/** Ajoute une nuit chambre seed au panier et encaisse en espèces. */
export async function completeCashRoomSale(page: Page) {
  await ensurePosSaleSeedData();
  await page.goto('/sale');
  await expect(page.getByRole('heading', { name: posSalePageConfig.title })).toBeVisible();

  const search = page.getByRole('searchbox', { name: posSalePageConfig.search.label });
  await search.fill('Standard');
  await expect(page.getByText(posSalePageConfig.search.loadingLabel)).toHaveCount(0, {
    timeout: 60_000,
  });

  const roomItem = page.getByRole('button', { name: new RegExp(ROOM_CATALOG_TITLE, 'i') });
  await expect(roomItem).toBeVisible({ timeout: 60_000 });
  await roomItem.click();

  const dialog = page.getByRole('dialog', { name: posSalePageConfig.config.title });
  await expect(dialog).toBeVisible();

  await dialog.locator('#room-start').fill(E2E_ROOM_STAY_START);
  await dialog.locator('#room-end').fill(E2E_ROOM_STAY_START);

  const previewResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/bookings/checkout-preview') && response.ok(),
    { timeout: 60_000 },
  );

  await dialog.getByRole('button', { name: posSalePageConfig.config.addLabel }).click();

  await expect(page.getByText(posSalePageConfig.cart.itemCount(1))).toBeVisible();
  await previewResponse;

  await expect(saleCartPanel(page).locator('[role="alert"]')).toHaveCount(0);
  await expect(saleCartPanel(page)).toContainText(posSalePageConfig.cart.totalLabel);
  await expect(saleCartPanel(page).locator('dl dd.text-lg.font-bold')).toContainText(/\d/);

  const cashButton = saleCartPanel(page).getByRole('button', {
    name: posSalePageConfig.payment.cashLabel,
  });
  await expect(cashButton).toBeEnabled({ timeout: 15_000 });
  await cashButton.click();

  await expect(page).toHaveURL(/\/sale\/success\?bookingId=/, { timeout: 60_000 });
  await expect(page.getByRole('heading', { name: posSaleSuccessPageConfig.title })).toBeVisible({
    timeout: 60_000,
  });
  await expect(page.getByLabel('Reçu de vente')).toBeVisible({ timeout: 30_000 });
}
