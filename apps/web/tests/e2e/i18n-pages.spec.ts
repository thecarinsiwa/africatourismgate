import { expect, test } from '@playwright/test';

async function switchToEnglish(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: /Choisir la langue|Select language|Elegir idioma/i }).first().click();
  await page.getByRole('menuitemradio', { name: /English/i }).click();
}

async function switchToSpanish(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: /Choisir la langue|Select language|Elegir idioma/i }).first().click();
  await page.getByRole('menuitemradio', { name: /Español/i }).click();
}

test.describe('Page i18n (FR/EN/ES)', () => {
  test('booking checkout shows localized title', async ({ page }) => {
    await page.goto('/booking');

    await expect(
      page.getByRole('heading', { name: 'Finalisation de la réservation' }),
    ).toBeVisible();

    await switchToEnglish(page);
    await expect(page.getByRole('heading', { name: 'Booking checkout' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Back to hotels' })).toBeVisible();

    await switchToSpanish(page);
    await expect(page.getByRole('heading', { name: 'Finalizar reserva' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Volver a hoteles' })).toBeVisible();
  });

  test('not found page shows localized title', async ({ page }) => {
    await page.goto('/this-page-does-not-exist-atg');

    await expect(page.getByRole('heading', { name: 'Page introuvable' })).toBeVisible();

    await switchToEnglish(page);
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Back to home' })).toBeVisible();
  });
});
