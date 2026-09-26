import { expect, test } from './fixtures';

test('email login stores session in sessionStorage and redirects to next', async ({ page }) => {
  test.setTimeout(60_000);

  await page.route('**/api/auth/login', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        accessToken: 'e2e-email-token',
        refreshToken: 'e2e-email-refresh',
        expiresIn: 3600,
        user: {
          id: 'user-email-login',
          email: 'client@example.com',
          firstName: 'Client',
          lastName: 'Email',
          preferredLanguage: 'fr',
          organizationId: null,
          status: 'active',
        },
      }),
    });
  });

  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: {
          id: 'user-email-login',
          email: 'client@example.com',
          firstName: 'Client',
          lastName: 'Email',
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
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        accessToken: 'e2e-email-token',
        refreshToken: 'e2e-email-refresh',
        expiresIn: 3600,
      }),
    });
  });

  await page.goto('/booking/login?next=%2Faccount%2Fprofile');
  await page.getByLabel(/Adresse e-mail|Email address|Correo electrónico/i).fill('client@example.com');
  await page.getByRole('textbox', { name: /^Mot de passe$|^Password$|^Contraseña$/i }).fill('secret-password');
  await Promise.all([
    page.waitForURL(/\/account\/profile$/, { timeout: 15_000 }),
    page.getByRole('button', { name: /Se connecter|Sign in|Iniciar sesión/i }).click(),
  ]);

  const stored = await page.evaluate(() => ({
    session: window.sessionStorage.getItem('atg.web.session'),
    local: window.localStorage.getItem('atg.web.session'),
  }));
  expect(stored.session).toContain('e2e-email-token');
  expect(stored.session).toContain('e2e-email-refresh');
  expect(stored.local).toBeNull();
});
