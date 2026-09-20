import { expect, test } from '@playwright/test';

test('google oauth callback stores session and redirects to next', async ({ page }) => {
  test.setTimeout(60_000);

  await page.route(/\/api\/auth\/me(\?|$)/, async (route) => {
    if (route.request().method() === 'OPTIONS') {
      await route.fulfill({ status: 204 });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: {
          id: 'user-google',
          email: 'client@gmail.com',
          firstName: 'Client',
          lastName: 'Google',
          preferredLanguage: 'fr',
          organizationId: null,
          status: 'active',
        },
        permissions: [],
        isSuperAdmin: false,
      }),
    });
  });

  await page.goto(
    '/booking/oauth/callback?accessToken=access_google&refreshToken=refresh_google&expiresIn=900&next=%2Fbooking%2Fcart',
  );

  // Prod `next start` can finish the client redirect before the intermediate
  // « Connexion Google » heading is observable — assert the destination instead.
  await expect(page).toHaveURL(/\/booking\/cart$/, { timeout: 20_000 });
  await expect(page.getByRole('heading', { name: /Panier|Cart|Carrito/i })).toBeVisible();

  const stored = await page.evaluate(() => ({
    session: window.sessionStorage.getItem('atg.web.session'),
    local: window.localStorage.getItem('atg.web.session'),
  }));
  expect(stored.session).toContain('access_google');
  expect(stored.session).toContain('refresh_google');
  expect(stored.local).toBeNull();
});
