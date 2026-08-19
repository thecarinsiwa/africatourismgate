import { expect, test } from '@playwright/test';
import { loginAsSeedAdmin } from './helpers/admin-auth';

const LANGUAGE_BUTTON = /Choisir la langue|Select language|Elegir idioma/i;

async function openLanguageMenu(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: LANGUAGE_BUTTON }).click();
  await expect(page.getByRole('menu', { name: LANGUAGE_BUTTON })).toBeVisible();
}

async function selectLocale(page: import('@playwright/test').Page, localeName: RegExp) {
  await openLanguageMenu(page);
  await page.getByRole('menuitemradio', { name: localeName }).click();
}

test.describe('Language switch (FR/EN/ES)', () => {
  test.describe.configure({ mode: 'serial' });

  test('admin login switches to English', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: 'Se connecter' })).toBeVisible();

    await selectLocale(page, /English/i);

    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    await expect(page.getByLabel('Email address')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  });

  test('admin login switches to Spanish', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: 'Se connecter' })).toBeVisible();

    await selectLocale(page, /Español/i);

    await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();
    await expect(page.getByLabel('Correo electrónico')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toBeVisible();
  });

  test('dashboard nav and users page show Spanish after switch', async ({ page }) => {
    await loginAsSeedAdmin(page);

    await selectLocale(page, /Español/i);

    await expect(page.getByRole('heading', { name: 'Panel de control' })).toBeVisible();
    const sidebar = page.getByRole('navigation');
    await sidebar.getByRole('button', { name: 'Usuarios y autenticación' }).click();
    await sidebar.getByRole('link', { name: 'Usuarios', exact: true }).click();

    await expect(page).toHaveURL(/\/utilisateurs/, { timeout: 15_000 });
    await expect(
      page.getByRole('heading', { name: 'Usuarios', exact: true }).first(),
    ).toBeVisible();
    await expect(
      page.getByText('Cuentas de la plataforma. Filtre por estado u organización.'),
    ).toBeVisible();
  });
});
