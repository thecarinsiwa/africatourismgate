import { expect, test, type Page } from '@playwright/test';

/** Force empty legal CMS so UI copy comes from next-intl messages. */
async function mockEmptyLegalPages(page: Page) {
  await page.route('**/api/public/legal-pages/**', async (route) => {
    await route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Not found' }),
    });
  });
}

async function switchLanguage(page: Page, language: RegExp) {
  await page
    .getByRole('button', { name: /Choisir la langue|Select language|Elegir idioma/i })
    .first()
    .click();
  await page.getByRole('menuitemradio', { name: language }).click();
}

test.describe('Language switch (FR/EN/ES)', () => {
  test('booking login shows English labels after switch', async ({ page }) => {
    await page.goto('/booking/login');

    await expect(page.getByRole('heading', { name: 'Connexion client' })).toBeVisible();

    await page.getByRole('button', { name: /Choisir la langue|Select language|Elegir idioma/i }).click();
    await page.getByRole('menuitemradio', { name: /English/i }).click();

    await expect(page.getByRole('heading', { name: 'Customer sign in' })).toBeVisible();
    await expect(page.getByLabel('Email address')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  });

  test('home navigation shows English after switch', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('link', { name: 'Connexion', exact: true })).toBeVisible();

    await page.getByRole('button', { name: /Choisir la langue|Select language|Elegir idioma/i }).first().click();
    await page.getByRole('menuitemradio', { name: /English/i }).click();

    await expect(page.getByRole('link', { name: 'Sign in', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Home', exact: true })).toBeVisible();
  });

  test('booking login shows Spanish labels after switch', async ({ page }) => {
    await page.goto('/booking/login');

    await expect(page.getByRole('heading', { name: 'Connexion client' })).toBeVisible();

    await page.getByRole('button', { name: /Choisir la langue|Select language|Elegir idioma/i }).click();
    await page.getByRole('menuitemradio', { name: /Español/i }).click();

    await expect(page.getByRole('heading', { name: 'Inicio de sesión del cliente' })).toBeVisible();
    await expect(page.getByLabel('Correo electrónico')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toBeVisible();
  });

  test('home navigation shows Spanish after switch', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('link', { name: 'Connexion', exact: true })).toBeVisible();

    await page.getByRole('button', { name: /Choisir la langue|Select language|Elegir idioma/i }).first().click();
    await page.getByRole('menuitemradio', { name: /Español/i }).click();

    await expect(page.getByRole('link', { name: 'Iniciar sesión', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Inicio', exact: true })).toBeVisible();
  });

  test('legal terms shows English labels after switch', async ({ page }) => {
    await mockEmptyLegalPages(page);
    await page.goto('/legal/terms');

    await expect(page.getByRole('heading', { name: "Conditions d'utilisation" })).toBeVisible();
    await expect(page.getByText('Contenu en cours de préparation')).toBeVisible();

    await switchLanguage(page, /English/i);

    await expect(page.getByRole('heading', { name: 'Terms of use' })).toBeVisible();
    await expect(page.getByText('Content coming soon')).toBeVisible();
    await expect(
      page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: 'Home' }),
    ).toBeVisible();
  });

  test('legal privacy shows Spanish labels after switch', async ({ page }) => {
    await mockEmptyLegalPages(page);
    await page.goto('/legal/privacy');

    await expect(page.getByRole('heading', { name: 'Politique de confidentialité' })).toBeVisible();
    await expect(page.getByText('Contenu en cours de préparation')).toBeVisible();

    await switchLanguage(page, /Español/i);

    await expect(page.getByRole('heading', { name: 'Política de privacidad' })).toBeVisible();
    await expect(page.getByText('Contenido en preparación')).toBeVisible();
    await expect(
      page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: 'Inicio' }),
    ).toBeVisible();
  });
});
