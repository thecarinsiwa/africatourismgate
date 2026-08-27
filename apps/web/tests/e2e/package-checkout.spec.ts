import { expect, test } from '@playwright/test';

const PACKAGE_ID = '00000000-0000-4000-8000-000000005001';
const BOOKING_ID = 'booking-e2e-package';
const DATE = '2026-08-01';
const END_DATE = '2026-08-02';
const TRAVELERS = 4;
const UNIT_PRICE_A = 4500;
const UNIT_PRICE_B = 3500;
const DISCOUNT_PERCENT = 15;
const PER_TRAVELER_TOTAL =
  UNIT_PRICE_A + UNIT_PRICE_B - Math.round(((UNIT_PRICE_A + UNIT_PRICE_B) * DISCOUNT_PERCENT) / 100);
const TOTAL_CENTS = PER_TRAVELER_TOTAL * TRAVELERS;

const packageDetailMock = {
  package: {
    id: PACKAGE_ID,
    name: 'Kinshasa Activities Duo',
    description: 'Two guided experiences in Kinshasa at a bundled discount.',
    discountPercent: String(DISCOUNT_PERCENT),
    durationDays: 1,
  },
  items: [
    {
      id: '00000000-0000-4000-8000-000000005002',
      packageId: PACKAGE_ID,
      itemType: 'activity',
      itemId: '00000000-0000-4000-8000-000000004031',
      label: 'Gombe City Tour',
      unitPriceCents: UNIT_PRICE_A,
      currency: 'USD',
    },
    {
      id: '00000000-0000-4000-8000-000000005003',
      packageId: PACKAGE_ID,
      itemType: 'activity',
      itemId: '00000000-0000-4000-8000-000000004032',
      label: 'Congo River Walk',
      unitPriceCents: UNIT_PRICE_B,
      currency: 'USD',
    },
  ],
  pricing: {
    subtotalCents: UNIT_PRICE_A + UNIT_PRICE_B,
    discountPercent: DISCOUNT_PERCENT,
    discountAmountCents: Math.round(((UNIT_PRICE_A + UNIT_PRICE_B) * DISCOUNT_PERCENT) / 100),
    totalCents: PER_TRAVELER_TOTAL,
    currency: 'USD',
  },
  images: [],
};

test('forfait activités: réserver sans créneaux, panier -> recap -> demande assistée', async ({
  page,
}) => {
  test.setTimeout(60_000);

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

  let postedCheckout: unknown = null;

  await page.route('**/api/bookings/request', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }

    postedCheckout = route.request().postDataJSON();

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

  await page.route(`**/api/bookings/${BOOKING_ID}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        booking: {
          id: BOOKING_ID,
          userId: 'user-e2e',
          status: 'pending_approval',
          totalCents: TOTAL_CENTS,
          currency: 'USD',
          promoCodeId: null,
          createdAt: new Date().toISOString(),
          updatedAt: null,
        },
        items: [],
        totalCents: TOTAL_CENTS,
        currency: 'USD',
      }),
    });
  });

  await page.goto(
    `/packages/${PACKAGE_ID}?startDate=${DATE}&travelers=${TRAVELERS}#configure`,
  );

  await expect(page.getByRole('heading', { name: 'Kinshasa Activities Duo' })).toBeVisible();
  await expect(page.getByText('Gombe City Tour')).toBeVisible();
  await expect(page.getByText('Congo River Walk')).toBeVisible();
  await expect(page.getByText(/aucun cr|no time slots|sin horarios/i)).not.toBeVisible();

  await page.getByRole('button', { name: /voir le r[ée]cap|view summary|ver resumen/i }).click();
  await expect(
    page.getByRole('heading', { name: /r[ée]capitulatif du forfait|package summary|resumen del paquete/i }),
  ).toBeVisible();

  await page.getByRole('button', { name: /ajouter au panier|add to cart|a[ñn]adir al carrito/i }).click();

  await expect(page).toHaveURL(/\/booking\/cart\?.*kind=package/);
  await expect(page.getByText('Kinshasa Activities Duo')).toBeVisible();
  await expect(page.getByText('Gombe City Tour')).toBeVisible();
  await expect(page.getByText('Congo River Walk')).toBeVisible();

  await page.getByRole('link', { name: /continuer vers r[ée]cap/i }).click();
  await expect(page).toHaveURL(/\/booking\/recap\?.*kind=package/);
  await expect(page.getByRole('heading', { name: /recapitulatif/i })).toBeVisible();

  await page.locator('input[name="preferredPaymentMethod"][value="stripe"]').check();
  const nameInputs = page.getByLabel(/nom complet|full name|nombre completo/i);
  const nameCount = await nameInputs.count();
  for (let i = 0; i < nameCount; i += 1) {
    await nameInputs.nth(i).fill(`Voyageur ${i + 1}`);
  }

  await expect(
    page.getByRole('button', { name: /demander une r[ée]servation|request a booking|solicitar una reserva/i }),
  ).toBeEnabled();
  await page
    .getByRole('button', { name: /demander une r[ée]servation|request a booking|solicitar una reserva/i })
    .click();
  await expect(page).toHaveURL(new RegExp(`/booking/request-success\\?booking_id=${BOOKING_ID}`), {
    timeout: 15_000,
  });

  expect(postedCheckout).toEqual({
    preferredPaymentMethod: 'stripe',
    packageId: PACKAGE_ID,
    items: [
      {
        itemType: 'package',
        referenceId: PACKAGE_ID,
        quantity: TRAVELERS,
        startDate: DATE,
        endDate: END_DATE,
      },
    ],
  });

  await expect(page.getByText(/demande envoy[ée]e|request submitted|solicitud enviada/i)).toBeVisible();
  await expect(page.getByText(/r[ée]f\. demande|request ref|ref\. solicitud/i)).toBeVisible();
});
