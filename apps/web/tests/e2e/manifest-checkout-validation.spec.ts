import { expect, test } from '@playwright/test';
import { fillCheckoutManifest, mockManifestApi } from './helpers/fill-manifest';
import { mockCheckoutAuth } from './helpers/mock-checkout-auth';

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

async function fillEmergencyContact(
  page: import('@playwright/test').Page,
  opts?: { name?: string; phone?: string },
) {
  await page
    .getByLabel(/nom du contact|contact name|nombre del contacto/i)
    .first()
    .fill(opts?.name ?? 'Contact Urgence');
  // Labels include required "*"; emergency phone is the only input[type=tel] on recap.
  await page.locator('input[type="tel"]').first().fill(opts?.phone ?? '+243900000001');
}

async function fillTravelersWithoutId(
  page: import('@playwright/test').Page,
) {
  const nameInputs = page.getByLabel(/nom complet|full name|nombre completo/i);
  const count = await nameInputs.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i += 1) {
    await nameInputs.nth(i).fill(`Voyageur ${i + 1}`);
  }

  // Traveler "Nationalité" only (emergency country is labeled "Pays").
  for (let i = 0; i < count; i += 1) {
    const nat = page
      .getByRole('button', {
        name: /nationalit|nationality|nacionalidad/i,
      })
      .nth(i);
    await nat.click();
    await page.locator('input[type="search"]').last().fill('Congo');
    await page.getByRole('option').filter({ hasText: /\(CD\)/i }).first().click();
  }
}

async function gotoPackageRecap(page: import('@playwright/test').Page) {
  await mockCheckoutAuth(page);
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
  await expect(page.getByRole('heading', { name: /r[ée]capitulatif|summary|resumen/i })).toBeVisible();
  await expect(
    page.getByText(/informations des voyageurs|traveler information|información de los viajeros/i),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', {
      name: /contact d.urgence|emergency contact|contacto de emergencia/i,
    }),
  ).toBeVisible();
}

test('manifeste checkout: bloqué si n° pièce manquant', async ({ page }) => {
  test.setTimeout(60_000);
  await gotoPackageRecap(page);

  await page.locator('input[name="preferredPaymentMethod"][value="stripe"]').check();
  await fillEmergencyContact(page);
  await fillTravelersWithoutId(page);
  // Leave idNumber empty on purpose

  await page
    .getByRole('button', {
      name: /demander une r[ée]servation|request a booking|solicitar una reserva/i,
    })
    .click();

  await expect(
    page
      .getByRole('alert')
      .filter({
        hasText: /pi[eè]ce d.identit|passport number|documento/i,
      })
      .first(),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/booking\/recap/);
});

test('manifeste checkout: bloqué si téléphone urgence manquant', async ({ page }) => {
  test.setTimeout(60_000);
  await gotoPackageRecap(page);

  await page.locator('input[name="preferredPaymentMethod"][value="stripe"]').check();
  await fillCheckoutManifest(page);

  await page.locator('input[type="tel"]').first().fill('');

  await page
    .getByRole('button', {
      name: /demander une r[ée]servation|request a booking|solicitar una reserva/i,
    })
    .click();

  await expect(
    page
      .getByRole('alert')
      .filter({
        hasText: /t[ée]l[ée]phone.*urgence|emergency contact phone|tel[ée]fono.*emergencia/i,
      })
      .first(),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/booking\/recap/);
});

test('manifeste checkout: bloqué si nom urgence manquant', async ({ page }) => {
  test.setTimeout(60_000);
  await gotoPackageRecap(page);

  await page.locator('input[name="preferredPaymentMethod"][value="stripe"]').check();
  await fillCheckoutManifest(page);

  await page
    .getByLabel(/nom du contact|contact name|nombre del contacto/i)
    .first()
    .fill('');

  await page
    .getByRole('button', {
      name: /demander une r[ée]servation|request a booking|solicitar una reserva/i,
    })
    .click();

  await expect(
    page
      .getByRole('alert')
      .filter({
        hasText: /nom.*urgence|emergency contact name|nombre.*emergencia/i,
      })
      .first(),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/booking\/recap/);
});

test('manifeste checkout: OK avec contact urgence booking-level + voyageurs', async ({
  page,
}) => {
  test.setTimeout(60_000);
  await gotoPackageRecap(page);

  const emergencyPatches: unknown[] = [];
  page.on('request', (req) => {
    if (req.method() === 'PATCH' && req.url().includes('/emergency-contact')) {
      emergencyPatches.push(req.postDataJSON());
    }
  });

  await page.locator('input[name="preferredPaymentMethod"][value="stripe"]').check();
  await fillCheckoutManifest(page);

  await page
    .getByRole('button', {
      name: /demander une r[ée]servation|request a booking|solicitar una reserva/i,
    })
    .click();

  await expect(page).toHaveURL(new RegExp(`/booking/request-success\\?booking_id=${BOOKING_ID}`), {
    timeout: 15_000,
  });
  expect(emergencyPatches.length).toBeGreaterThanOrEqual(1);
  expect(emergencyPatches[0]).toEqual(
    expect.objectContaining({
      name: 'Contact Urgence',
      phone: '+243900000001',
    }),
  );
});
