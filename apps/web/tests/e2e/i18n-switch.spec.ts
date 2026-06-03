import { expect, test } from '@playwright/test';

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
});
