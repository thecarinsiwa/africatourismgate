import { expect, test, type Page } from './fixtures';
import {
  E2E_VERIFY_ACCESS_TOKEN,
  E2E_VERIFY_ID,
  E2E_VERIFY_REFRESH_TOKEN,
  mockCheckoutAuth,
  mockRegisterRequiresVerification,
  mockVerifyOperationSuccess,
} from './helpers/mock-checkout-auth';

const VERIFY_TITLE =
  /Vérification par e-mail|Email verification|Verificación por correo|Finaliser la création|Finish creating|Finalice la creación/i;
const OTP_LABEL = /Code à 6 chiffres|6-digit code|Código de 6 dígitos/i;
const CONFIRM_OTP =
  /Confirmer et continuer|Confirm and continue|Confirmar y continuar/i;

async function fillRegisterForm(page: Page, email: string): Promise<void> {
  await page.getByRole('textbox', { name: /^Prénom$|^First name$|^Nombre$/i }).fill('New');
  await page.getByRole('textbox', { name: /^Nom$|^Last name$|^Apellido$/i }).fill('Client');
  await page
    .getByLabel(/Adresse e-mail|Email address|Correo electrónico/i)
    .fill(email);
  await page
    .getByRole('textbox', { name: /^Mot de passe$|^Password$|^Contraseña$/i })
    .fill('secret-password');
  await page
    .getByRole('textbox', {
      name: /Confirmer le mot de passe|Confirm password|Confirmar contraseña/i,
    })
    .fill('secret-password');
  await page.locator('#acceptTerms').check();
}

async function registerThenEnterOtp(
  page: Page,
  opts: { email: string; nextEncoded: string },
): Promise<void> {
  await mockRegisterRequiresVerification(page);
  await mockVerifyOperationSuccess(page);
  await mockCheckoutAuth(page);

  await page.goto(`/booking/register?next=${opts.nextEncoded}`);
  await fillRegisterForm(page, opts.email);

  await Promise.all([
    page.waitForURL(
      new RegExp(
        `/booking/verify\\?.*verificationId=${E2E_VERIFY_ID}.*next=${opts.nextEncoded}`,
      ),
      { timeout: 15_000, waitUntil: 'commit' },
    ),
    page
      .getByRole('button', {
        name: /Créer mon compte|Create my account|Crear mi cuenta/i,
      })
      .click(),
  ]);

  await expect(page.getByRole('heading', { name: VERIFY_TITLE })).toBeVisible({
    timeout: 15_000,
  });
  await page.getByLabel(OTP_LABEL).fill('123456');
}

async function assertVerifySessionStored(page: Page): Promise<void> {
  const stored = await page.evaluate(() => ({
    session: window.sessionStorage.getItem('atg.web.session'),
    local: window.localStorage.getItem('atg.web.session'),
  }));
  expect(stored.session).toContain(E2E_VERIFY_ACCESS_TOKEN);
  expect(stored.session).toContain(E2E_VERIFY_REFRESH_TOKEN);
  expect(stored.local).toBeNull();
}

test('register requiring OTP redirects to verify then cart with session', async ({
  page,
}) => {
  test.setTimeout(60_000);

  await registerThenEnterOtp(page, {
    email: 'new.verify.cart@example.com',
    nextEncoded: '%2Fbooking%2Fcart',
  });

  await Promise.all([
    page.waitForURL(/\/booking\/cart\/?$/, {
      timeout: 15_000,
      waitUntil: 'commit',
    }),
    page.getByRole('button', { name: CONFIRM_OTP }).click(),
  ]);

  await assertVerifySessionStored(page);
});

test('register requiring OTP then account is accessible with session', async ({
  page,
}) => {
  test.setTimeout(60_000);

  await registerThenEnterOtp(page, {
    email: 'new.verify.account@example.com',
    nextEncoded: '%2Faccount%2Fprofile',
  });

  await Promise.all([
    page.waitForURL(/\/account\/profile\/?$/, {
      timeout: 15_000,
      waitUntil: 'commit',
    }),
    page.getByRole('button', { name: CONFIRM_OTP }).click(),
  ]);

  await assertVerifySessionStored(page);

  // Guard must treat session as authenticated (no bounce to login).
  await page.goto('/account');
  await expect(page).toHaveURL(/\/account(\/|$)/, { timeout: 15_000 });
  await expect(page).not.toHaveURL(/\/booking\/login/);
});
