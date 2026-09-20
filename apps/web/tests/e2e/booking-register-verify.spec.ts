import { expect, test } from '@playwright/test';
import {
  E2E_VERIFY_ACCESS_TOKEN,
  E2E_VERIFY_ID,
  E2E_VERIFY_REFRESH_TOKEN,
  mockCheckoutAuth,
  mockRegisterRequiresVerification,
  mockVerifyOperationSuccess,
} from './helpers/mock-checkout-auth';

test('register requiring OTP redirects to verify then cart with session', async ({ page }) => {
  test.setTimeout(60_000);

  await mockRegisterRequiresVerification(page);
  await mockVerifyOperationSuccess(page);
  await mockCheckoutAuth(page);

  await page.goto('/booking/register?next=%2Fbooking%2Fcart');
  await page.getByRole('textbox', { name: /^Prénom$|^First name$|^Nombre$/i }).fill('New');
  await page.getByRole('textbox', { name: /^Nom$|^Last name$|^Apellido$/i }).fill('Client');
  await page
    .getByLabel(/Adresse e-mail|Email address|Correo electrónico/i)
    .fill('new.verify@example.com');
  await page.getByRole('textbox', { name: /^Mot de passe$|^Password$|^Contraseña$/i }).fill('secret-password');
  await page
    .getByRole('textbox', { name: /Confirmer le mot de passe|Confirm password|Confirmar contraseña/i })
    .fill('secret-password');
  await page.getByRole('checkbox').check();

  await Promise.all([
    page.waitForURL(
      new RegExp(
        `/booking/verify\\?.*verificationId=${E2E_VERIFY_ID}.*next=%2Fbooking%2Fcart`,
      ),
      { timeout: 15_000 },
    ),
    page.getByRole('button', { name: /Créer mon compte|Create my account|Crear mi cuenta/i }).click(),
  ]);

  await expect(page.getByRole('heading', { name: 'Vérification par e-mail' })).toBeVisible();

  await page.getByLabel('Code à 6 chiffres').fill('123456');

  await Promise.all([
    page.waitForURL(/\/booking\/cart\/?$/, { timeout: 15_000 }),
    page.getByRole('button', { name: 'Confirmer et continuer' }).click(),
  ]);

  const stored = await page.evaluate(() => ({
    session: window.sessionStorage.getItem('atg.web.session'),
    local: window.localStorage.getItem('atg.web.session'),
  }));
  expect(stored.session).toContain(E2E_VERIFY_ACCESS_TOKEN);
  expect(stored.session).toContain(E2E_VERIFY_REFRESH_TOKEN);
  expect(stored.local).toBeNull();
});
