import type { Page } from '@playwright/test';

/** Keep BookingAuthGuard / ensureClientAccessToken happy during checkout e2e. */
export async function mockCheckoutAuth(page: Page): Promise<void> {
  await page.route('**/api/auth/me', async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: {
          id: 'user-e2e',
          email: 'client.e2e@example.com',
          firstName: 'Client',
          lastName: 'E2E',
          preferredLanguage: 'fr',
          organizationId: null,
          status: 'active',
        },
        permissions: [],
        isSuperAdmin: false,
      }),
    });
  });

  await page.route('**/api/auth/refresh', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        accessToken: 'e2e-token-refreshed',
        refreshToken: 'e2e-refresh-token',
        expiresIn: 3600,
      }),
    });
  });
}
