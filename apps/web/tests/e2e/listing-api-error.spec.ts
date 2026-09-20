import { expect, test, type Page } from '@playwright/test';

async function mockAccommodationsApiDown(page: Page) {
  await page.route('**/api/public/accommodations/search**', async (route) => {
    await route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Service unavailable' }),
    });
  });
}

async function mockFlightsApiDown(page: Page) {
  await page.route('**/api/public/flights/search**', async (route) => {
    await route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Service unavailable' }),
    });
  });
}

test.describe('Listing API error states (WEB-011)', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ page }) => {
    const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3002';
    await page.context().addCookies([{ name: 'atg-locale', value: 'fr', url: baseURL }]);
  });

  test('hotels listing shows load error + retry when API returns 503', async ({ page }) => {
    await mockAccommodationsApiDown(page);

    await page.goto('/hotels');

    await expect(
      page.getByText(/Impossible de charger les résultats/i).first(),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole('button', { name: 'Réessayer' })).toBeVisible();
  });

  test('flights listing shows load error + retry when API returns 503', async ({ page }) => {
    await mockFlightsApiDown(page);

    await page.goto('/flights');

    await expect(
      page.getByRole('button', { name: 'Réessayer' }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(
      page.getByText(/Impossible de charger les vols/i).first(),
    ).toBeVisible();
  });
});
