import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * Extends Playwright `page` so unmocked `/api/**` calls get an HTTP 503 instead of a
 * network error (which would raise the Connexion interrompue overlay).
 * Spec-specific `page.route` handlers registered later take precedence.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route('**/api/**', async (route) => {
      const url = route.request().url();
      // Branding / media assets must not be stubbed as JSON 503 (breaks layout; can cascade).
      if (url.includes('/api/uploads/')) {
        await route.fallback();
        return;
      }
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'E2E: API not running' }),
      });
    });
    await use(page);
  },
});

export { expect };
export type { Page };
