import { expect, test } from '@playwright/test';

const USER_ID = 'user-e2e-account';

function mockSession(page: import('@playwright/test').Page) {
  return page.addInitScript(() => {
    window.sessionStorage.setItem(
      'atg.web.session',
      JSON.stringify({
        accessToken: 'e2e-account-token',
        refreshToken: 'e2e-account-refresh',
        expiresAt: Date.now() + 60 * 60 * 1000,
        user: {
          id: 'user-e2e-account',
          email: 'client.e2e@example.com',
          firstName: 'Client',
          lastName: 'E2E',
          organizationId: null,
          status: 'active',
        },
      }),
    );
  });
}

test('redirects to login when visiting /account without session', async ({ page }) => {
  await page.goto('/account/profile');
  await expect(page).toHaveURL(/\/booking\/login\?next=%2Faccount%2Fprofile/);
});

test('shows only current user bookings on /account/reservations', async ({ page }) => {
  await mockSession(page);

  await page.route('**/api/bookings**', async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [
          {
            id: 'booking-mine',
            userId: USER_ID,
            status: 'confirmed',
            totalCents: 120000,
            currency: 'USD',
            promoCodeId: null,
            createdAt: '2026-01-15T10:00:00.000Z',
            updatedAt: null,
            clientEmail: 'client.e2e@example.com',
            clientFirstName: 'Client',
            clientLastName: 'E2E',
            organizationId: null,
          },
        ],
        meta: { total: 1, page: 1, limit: 50, totalPages: 1 },
      }),
    });
  });

  await page.goto('/account/reservations');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await expect(page.getByText('1200.00')).toBeVisible();
  await expect(page.getByText(/Confirmée|Confirmed|Confirmada/i)).toBeVisible();
});

test('profile form submits PATCH /auth/me', async ({ page }) => {
  await mockSession(page);

  let patchCalled = false;
  await page.route('**/api/auth/me', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: USER_ID,
            email: 'client.e2e@example.com',
            firstName: 'Client',
            lastName: 'E2E',
            phone: null,
            preferredLanguage: 'fr',
            organizationId: null,
            status: 'active',
          },
          permissions: ['bookings.read'],
          isSuperAdmin: false,
        }),
      });
      return;
    }
    if (route.request().method() === 'PATCH') {
      patchCalled = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: USER_ID,
          email: 'client.e2e@example.com',
          firstName: 'Updated',
          lastName: 'E2E',
          phone: '+243800000000',
          preferredLanguage: 'fr',
          organizationId: null,
          status: 'active',
        }),
      });
      return;
    }
    await route.continue();
  });

  await page.goto('/account/profile');
  await page.locator('input').nth(1).fill('Updated');
  await page.getByRole('button', { name: /Enregistrer|Save|Guardar/i }).click();
  await expect(page.getByText(/Profil mis à jour|Profile updated|Perfil actualizado/i)).toBeVisible();
  expect(patchCalled).toBe(true);
});

test('reservations table shows scoped booking rows only', async ({ page }) => {
  await mockSession(page);

  await page.route('**/api/bookings**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [
          {
            id: 'aaaa1111-2222-3333-4444-555566667777',
            userId: USER_ID,
            status: 'pending_payment',
            totalCents: 50000,
            currency: 'USD',
            promoCodeId: null,
            createdAt: '2026-02-01T12:00:00.000Z',
            updatedAt: null,
            clientEmail: 'client.e2e@example.com',
            clientFirstName: 'Client',
            clientLastName: 'E2E',
            organizationId: null,
          },
        ],
        meta: { total: 1, page: 1, limit: 50, totalPages: 1 },
      }),
    });
  });

  await page.goto('/account/reservations');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await expect(page.getByText('aaaa1111')).toBeVisible();
});

test('logout clears session from both storages and redirects to login', async ({ page }) => {
  await mockSession(page);

  await page.route('**/api/auth/logout', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    });
  });

  await page.goto('/booking/logout');
  await expect(page).toHaveURL(/\/booking\/login$/);

  const cleared = await page.evaluate(() => ({
    local: window.localStorage.getItem('atg.web.session'),
    session: window.sessionStorage.getItem('atg.web.session'),
  }));
  expect(cleared.local).toBeNull();
  expect(cleared.session).toBeNull();
});
