import { expect, test } from '@playwright/test';

test('customer registration stores session and redirects to next', async ({ page }) => {
  await page.route('**/api/auth/register/customer', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        accessToken: 'e2e-register-token',
        refreshToken: 'e2e-register-refresh',
        expiresIn: 3600,
        user: {
          id: 'user-register',
          email: 'new.client@example.com',
          firstName: 'New',
          lastName: 'Client',
          preferredLanguage: 'fr',
          organizationId: null,
          status: 'active',
        },
      }),
    });
  });

  await page.goto('/booking/register?next=%2Faccount%2Fprofile');
  await page.getByLabel(/^Prénom$|^First name$|^Nombre$/i).fill('New');
  await page.getByLabel(/^Nom$|^Last name$|^Apellido$/i).fill('Client');
  await page.getByLabel(/Adresse e-mail|Email address|Correo electrónico/i).fill('new.client@example.com');
  await page.getByLabel(/^Mot de passe$|^Password$|^Contraseña$/i).first().fill('secret-password');
  await page.getByLabel(/Confirmer le mot de passe|Confirm password|Confirmar contraseña/i).fill(
    'secret-password',
  );
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: /Créer mon compte|Create my account|Crear mi cuenta/i }).click();

  await expect(page).toHaveURL(/\/account\/profile$/);

  const stored = await page.evaluate(() => ({
    session: window.sessionStorage.getItem('atg.web.session'),
    local: window.localStorage.getItem('atg.web.session'),
  }));
  expect(stored.session).toContain('e2e-register-token');
  expect(stored.session).toContain('e2e-register-refresh');
  expect(stored.local).toBeNull();
});

test('login page links to register with next param preserved', async ({ page }) => {
  await page.goto('/booking/login?next=%2Fbooking%2Fcart');
  const registerLink = page.getByRole('link', {
    name: /Créer un compte|Create an account|Crear una cuenta/i,
  });
  await expect(registerLink).toHaveAttribute('href', '/booking/register?next=%2Fbooking%2Fcart');
});

test('shows friendly message when email is already registered', async ({ page }) => {
  await page.route('**/api/auth/register/customer', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 409,
      contentType: 'application/json',
      body: JSON.stringify({
        statusCode: 409,
        message: 'Email already registered',
        error: 'Conflict',
      }),
    });
  });

  await page.goto('/booking/register?next=%2Faccount%2Fprofile');
  await page.getByLabel(/^Prénom$|^First name$|^Nombre$/i).fill('Existing');
  await page.getByLabel(/^Nom$|^Last name$|^Apellido$/i).fill('User');
  await page.getByLabel(/Adresse e-mail|Email address|Correo electrónico/i).fill('taken@example.com');
  await page.getByLabel(/^Mot de passe$|^Password$|^Contraseña$/i).first().fill('secret-password');
  await page.getByLabel(/Confirmer le mot de passe|Confirm password|Confirmar contraseña/i).fill(
    'secret-password',
  );
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: /Créer mon compte|Create my account|Crear mi cuenta/i }).click();

  const errorAlert = page.locator('[role="alert"]').filter({ hasText: /déjà utilisée|already in use|ya está en uso/i });
  await expect(errorAlert).toBeVisible();
  await expect(errorAlert.getByRole('link', { name: /Se connecter|Sign in|Iniciar sesión/i })).toBeVisible();
  await expect(page).toHaveURL(/\/booking\/register\?next=%2Faccount%2Fprofile$/);
});
