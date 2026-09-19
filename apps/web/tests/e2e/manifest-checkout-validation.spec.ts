import { expect, test } from '@playwright/test';
import { fillCheckoutManifest, mockManifestApi } from './helpers/fill-manifest';

const PACKAGE_ID = '00000000-0000-4000-8000-000000005001';
const BOOKING_ID = 'booking-e2e-package-manifest';
const DATE = '2026-08-01';
const TRAVELERS = 2;
const TOTAL_CENTS = 15300;

const packageDetailMock = {
  package: {
    id: PACKAGE_ID,
    name: 'Kinshasa Activities Duo',
    description: 'Two guided experiences in Kinshasa at a bundled discount.',
    discountPercent: '15',
    durationDays: 1,
  },
  items: [
    {
      id: '00000000-0000-4000-8000-000000005002',
      packageId: PACKAGE_ID,
      itemType: 'activity',
      itemId: '00000000-0000-4000-8000-000000004031',
      label: 'Gombe City Tour',
      unitPriceCents: 4500,
      currency: 'USD',
    },
    {
      id: '00000000-0000-4000-8000-000000005003',
      packageId: PACKAGE_ID,
      itemType: 'activity',
      itemId: '00000000-0000-4000-8000-000000004032',
      label: 'Congo River Walk',
      unitPriceCents: 3500,
      currency: 'USD',
    },
  ],
  pricing: {
    subtotalCents: 8000,
    discountPercent: 15,
    discountAmountCents: 1200,
    totalCents: 6800,
    currency: 'USD',
  },
  images: [],
};

async function gotoPackageRecap(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    window.sessionStorage.setItem(
      'atg.web.session',
      JSON.stringify({
        accessToken: 'e2e-token',
        refreshToken: 'e2e-refresh-token',
        expiresAt: Date.now() + 60 * 60 * 1000,
        user: {
          id: 'user-e2e',
          email: 'client.e2e@example.com',
          firstName: 'Client',
          lastName: 'E2E',
          organizationId: null,
          status: 'active',
        },
      }),
    );
  });

  await page.route(`**/api/public/packages/${PACKAGE_ID}**`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(packageDetailMock),
    });
  });

  await page.route('**/api/bookings/request', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        bookingId: BOOKING_ID,
        status: 'pending_approval',
        message: 'Booking request submitted',
        totalCents: TOTAL_CENTS,
        currency: 'USD',
      }),
    });
  });

  await mockManifestApi(page);

  await page.goto(
    `/booking/recap?kind=package&packageId=${PACKAGE_ID}&startDate=${DATE}&endDate=2026-08-02&travelers=${TRAVELERS}`,
  );
  await expect(page.getByRole('heading', { name: /recapitulatif/i })).toBeVisible();
  await expect(page.getByText(/informations des voyageurs|traveler information|información de los viajeros/i)).toBeVisible();
}

test('manifeste checkout: bloqué si n° pièce manquant', async ({ page }) => {
  test.setTimeout(60_000);
  await gotoPackageRecap(page);

  await page.locator('input[name="preferredPaymentMethod"][value="stripe"]').check();

  const nameInputs = page.getByLabel(/nom complet|full name|nombre completo/i);
  const count = await nameInputs.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i += 1) {
    await nameInputs.nth(i).fill(`Voyageur ${i + 1}`);
  }

  for (let i = 0; i < count; i += 1) {
    const nat = page.getByLabel(/^nationalit[eé]$|^nationality$|^nacionalidad$/i).nth(i);
    await nat.click();
    await page.locator('input[type="search"]').last().fill('Congo');
    await page.getByRole('option').filter({ hasText: /\(CD\)/i }).first().click();
  }
  // Leave idNumber empty on purpose

  await page
    .getByRole('button', { name: /demander une r[ée]servation|request a booking|solicitar una reserva/i })
    .click();

  await expect(
    page.getByRole('alert').filter({
      hasText: /pi[eè]ce d.identit|passport number|documento/i,
    }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/booking\/recap/);
});

test('manifeste checkout: OK avec nom + nationalité + n° pièce (genre vide)', async ({ page }) => {
  test.setTimeout(60_000);
  await gotoPackageRecap(page);

  await page.locator('input[name="preferredPaymentMethod"][value="stripe"]').check();
  await fillCheckoutManifest(page);

  await page
    .getByRole('button', { name: /demander une r[ée]servation|request a booking|solicitar una reserva/i })
    .click();

  await expect(page).toHaveURL(new RegExp(`/booking/request-success\\?booking_id=${BOOKING_ID}`), {
    timeout: 15_000,
  });
});
