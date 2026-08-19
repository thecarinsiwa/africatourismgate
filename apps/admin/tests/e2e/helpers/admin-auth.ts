import { expect, type Page } from '@playwright/test';

export const SEED_ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@africatourismgate.local';
export const SEED_ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe123!';

const EMAIL_LABEL = /Adresse email|Email address|Correo electrónico/i;
const PASSWORD_LABEL = /Mot de passe|Password|Contraseña/i;
const SUBMIT_LABEL = /Se connecter|Sign in|Iniciar sesión/i;

export async function loginAsSeedAdmin(page: Page) {
  await page.goto('/login');
  await page.getByRole('textbox', { name: EMAIL_LABEL }).fill(SEED_ADMIN_EMAIL);
  await page.getByRole('textbox', { name: PASSWORD_LABEL }).fill(SEED_ADMIN_PASSWORD);
  await page.getByRole('button', { name: SUBMIT_LABEL }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 20_000 });
}
