import { expect, test } from '@playwright/test';

const USER_ID = 'user-e2e-loyalty';

test.use({ storageState: { cookies: [], origins: [] } });

function mockSessionInit(page: import('@playwright/test').Page) {
  return page.addInitScript((userId: string) => {
    window.localStorage.removeItem('atg.web.session');
    window.sessionStorage.setItem(
      'atg.web.session',
      JSON.stringify({
        accessToken: 'e2e-loyalty-token',
        refreshToken: 'e2e-loyalty-refresh',
        expiresAt: Date.now() + 60 * 60 * 1000,
        user: {
          id: userId,
          email: 'loyalty.e2e@example.com',
          firstName: 'Loyalty',
          lastName: 'E2E',
          organizationId: null,
          status: 'active',
        },
      }),
    );
  }, USER_ID);
}

function mockLoyaltyApi(page: import('@playwright/test').Page) {
  return page.route(/\/api\/loyalty-accounts/, async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [
          {
            id: 'loyalty-e2e-onekey',
            userId: USER_ID,
            programCode: 'ONEKEY',
            pointsBalance: 250,
            tier: 'silver',
            createdAt: '2026-01-10T10:00:00.000Z',
            updatedAt: null,
          },
        ],
        meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
      }),
    });
  });
}

test('redirects to login when visiting /account/loyalty without session', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.removeItem('atg.web.session');
    window.sessionStorage.removeItem('atg.web.session');
  });
  await page.goto('/account/loyalty', { waitUntil: 'domcontentloaded' });
  await page.waitForURL(/\/booking\/login\?next=%2Faccount%2Floyalty/, { timeout: 15_000 });
});

test('displays OneKey balance and tier on /account/loyalty', async ({ page }) => {
  await mockSessionInit(page);
  await mockLoyaltyApi(page);

  await page.goto('/account/loyalty', { waitUntil: 'networkidle' });

  await expect(page.getByTestId('loyalty-points-balance')).toHaveText('250', {
    timeout: 15_000,
  });
  await expect(page.getByText(/Silver/i)).toBeVisible();
  await expect(page.getByText(/Programme · ONEKEY/)).toBeVisible();
  await expect(
    page.getByText(/crédités après|Points are credited|credited after|acreditan tras/i),
  ).toBeVisible();
});
