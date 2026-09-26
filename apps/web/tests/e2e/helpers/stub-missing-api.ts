import { test } from '@playwright/test';

/**
 * Web E2E does not start the API. Unmocked `fetch` to localhost:3000 would throw,
 * which raises the global "Connexion interrompue" overlay (z-[200]) and blocks clicks.
 *
 * Register a catch-all first; test-specific `page.route` handlers registered later win.
 */
test.beforeEach(async ({ page }) => {
  await page.route('**/api/**', async (route) => {
    await route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'E2E: API not running' }),
    });
  });
});
