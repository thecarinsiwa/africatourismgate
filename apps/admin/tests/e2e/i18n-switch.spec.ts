import { expect, test } from '@playwright/test';

test('admin login switches to English', async ({ page }) => {
  await page.goto('/login');

  await expect(page.getByRole('heading', { name: 'Se connecter' })).toBeVisible();

  await page.getByRole('button', { name: /Choisir la langue|Select language/i }).click();
  await page.getByRole('menuitemradio', { name: /English/i }).click();

  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  await expect(page.getByLabel('Email address')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
});
