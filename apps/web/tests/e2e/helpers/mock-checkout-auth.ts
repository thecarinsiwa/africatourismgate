import type { Page } from '@playwright/test';

export const E2E_VERIFY_ID = 'ver-e2e-register';
export const E2E_VERIFY_ACCESS_TOKEN = 'e2e-verify-token';
export const E2E_VERIFY_REFRESH_TOKEN = 'e2e-verify-refresh';

const e2eUser = {
  id: 'user-e2e',
  email: 'client.e2e@example.com',
  firstName: 'Client',
  lastName: 'E2E',
  preferredLanguage: 'fr',
  organizationId: null,
  status: 'active',
};

/** Keep BookingAuthGuard / ensureClientAccessToken happy during checkout e2e. */
export async function mockCheckoutAuth(page: Page): Promise<void> {
  await page.route('**/api/auth/me', async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: e2eUser,
        permissions: [],
        isSuperAdmin: false,
      }),
    });
  });

  await page.route('**/api/auth/refresh', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        accessToken: 'e2e-token-refreshed',
        refreshToken: 'e2e-refresh-token',
        expiresIn: 3600,
      }),
    });
  });
}

/** Customer register that requires e-mail OTP before issuing tokens. */
export async function mockRegisterRequiresVerification(
  page: Page,
  verificationId: string = E2E_VERIFY_ID,
): Promise<void> {
  await page.route('**/api/auth/register/customer', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        accessToken: '',
        refreshToken: '',
        expiresIn: 0,
        user: e2eUser,
        requiresVerification: true,
        verificationId,
      }),
    });
  });
}

/** Successful OTP verify-operation → full auth session. */
export async function mockVerifyOperationSuccess(
  page: Page,
  tokens: {
    accessToken?: string;
    refreshToken?: string;
  } = {},
): Promise<void> {
  const accessToken = tokens.accessToken ?? E2E_VERIFY_ACCESS_TOKEN;
  const refreshToken = tokens.refreshToken ?? E2E_VERIFY_REFRESH_TOKEN;

  await page.route('**/api/auth/verify-operation', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        accessToken,
        refreshToken,
        expiresIn: 3600,
        user: e2eUser,
      }),
    });
  });
}
