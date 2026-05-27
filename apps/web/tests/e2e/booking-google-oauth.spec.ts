import { expect, test } from '@playwright/test';

test('google oauth callback stores session and redirects to next', async ({ page }) => {
  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: {
          id: 'user-google',
          email: 'client@gmail.com',
          firstName: 'Client',
          lastName: 'Google',
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

  await expect(page).toHaveURL(/\/booking\/cart$/);
  const stored = await page.evaluate(() => window.localStorage.getItem('atg.web.session'));
  expect(stored).toContain('access_google');
  expect(stored).toContain('refresh_google');
});
