import { expect, test } from '@playwright/test';

const PACKAGE_ID = '00000000-0000-4000-8000-000000005001';
const ACTIVITY_A = '00000000-0000-4000-8000-000000004031';
const ACTIVITY_B = '00000000-0000-4000-8000-000000004032';
const SCHEDULE_A = '00000000-0000-4000-8000-000000004033';
const SCHEDULE_B = '00000000-0000-4000-8000-000000004035';
const BOOKING_ID = 'booking-e2e-package';
const DATE = '2026-07-20';
const PARTICIPANTS = 2;
const UNIT_PRICE_A = 4500;
const UNIT_PRICE_B = 3500;
const DISCOUNT_PERCENT = 15;
const SUBTOTAL_CENTS = (UNIT_PRICE_A + UNIT_PRICE_B) * PARTICIPANTS;
const TOTAL_CENTS = SUBTOTAL_CENTS - Math.round((SUBTOTAL_CENTS * DISCOUNT_PERCENT) / 100);

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
      itemId: ACTIVITY_A,
      label: 'Gombe City Tour',
      unitPriceCents: UNIT_PRICE_A,
      currency: 'USD',
    },
    {
      id: '00000000-0000-4000-8000-000000005003',
      packageId: PACKAGE_ID,
      itemType: 'activity',
      itemId: ACTIVITY_B,
      label: 'Congo River Walk',
      unitPriceCents: UNIT_PRICE_B,
      currency: 'USD',
    },
  ],
  pricing: {
    subtotalCents: UNIT_PRICE_A + UNIT_PRICE_B,
    discountPercent: DISCOUNT_PERCENT,
    discountAmountCents: Math.round(((UNIT_PRICE_A + UNIT_PRICE_B) * DISCOUNT_PERCENT) / 100),
    totalCents:
      UNIT_PRICE_A + UNIT_PRICE_B - Math.round(((UNIT_PRICE_A + UNIT_PRICE_B) * DISCOUNT_PERCENT) / 100),
    currency: 'USD',
  },
  images: [],
};

function activityDetailMock(
  id: string,
  title: string,
  scheduleId: string,
  startDatetime: string,
  priceCents: number,
) {
  return {
    id,
    title,
    description: `${title} description`,
    durationMinutes: 120,
    priceCents,
    currency: 'USD',
    destination: 'Kinshasa',
    providerName: 'Tourism Gate Experiences Kinshasa',
    date: DATE,
    participants: PARTICIPANTS,
    schedules: [
      {
        scheduleId,
        startDatetime,
        capacity: 12,
        bookedCount: 0,
        remainingPlaces: 12,
        priceCents,
        currency: 'USD',
      },
    ],
  };
}

const activityAMock = activityDetailMock(
  ACTIVITY_A,
  'Gombe City Tour',
  SCHEDULE_A,
  '2026-07-20T09:00:00.000Z',
  UNIT_PRICE_A,
);

const activityBMock = activityDetailMock(
  ACTIVITY_B,
  'Congo River Walk',
  SCHEDULE_B,
  '2026-07-20T16:00:00.000Z',
  UNIT_PRICE_B,
);

test('forfait activités: configurer créneaux, panier -> recap -> Stripe avec packageId', async ({
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

  await page.route(`**/api/public/activities/${ACTIVITY_A}**`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(activityAMock),
    });
  });

  await page.route(`**/api/public/activities/${ACTIVITY_B}**`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(activityBMock),
    });
  });

  let postedCheckout: unknown = null;

  await page.route('**/api/bookings', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }

    postedCheckout = route.request().postDataJSON();

    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        booking: {
          id: BOOKING_ID,
          userId: 'user-e2e',
          status: 'pending_payment',
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

  await page.route(`**/api/bookings/${BOOKING_ID}/checkout-session`, async (route) => {
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        paymentId: 'payment-e2e-package',
        sessionId: 'cs_test_e2e_package',
        url: `http://127.0.0.1:3002/booking/success?booking_id=${BOOKING_ID}`,
        amountCents: TOTAL_CENTS,
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
          status: 'confirmed',
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

  await page.goto(`/packages/${PACKAGE_ID}?date=${DATE}&participants=${PARTICIPANTS}`);

  await expect(page.getByRole('heading', { name: 'Kinshasa Activities Duo' })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: /choisir les cr|choose time slots|elegir horarios/i }),
  ).toBeVisible();

  const gombeSection = page.locator('article').filter({ hasText: 'Gombe City Tour' });
  await gombeSection.getByRole('radio').first().click();

  const riverSection = page.locator('article').filter({ hasText: 'Congo River Walk' });
  await riverSection.getByRole('radio').first().click();

  await page.getByRole('button', { name: /voir le r[ée]cap|view summary|ver resumen/i }).click();
  await expect(
    page.getByRole('heading', { name: /r[ée]capitulatif du forfait|package summary|resumen del paquete/i }),
  ).toBeVisible();

  await page.locator('#reserve').getByRole('button', {
    name: /ajouter au panier|add to cart|a[ñn]adir al carrito/i,
  }).click();

  await expect(page).toHaveURL(/\/booking\/cart\?.*kind=package/);
  await expect(page.getByText('Kinshasa Activities Duo')).toBeVisible();
  await expect(page.getByText('Gombe City Tour')).toBeVisible();
  await expect(page.getByText('Congo River Walk')).toBeVisible();

  await page.getByRole('link', { name: /continuer vers r[ée]cap/i }).click();
  await expect(page).toHaveURL(/\/booking\/recap\?.*kind=package/);
  await expect(page.getByRole('heading', { name: /recapitulatif/i })).toBeVisible();

  await expect(page.getByRole('button', { name: /payer avec stripe/i })).toBeEnabled();
  await page.getByRole('button', { name: /payer avec stripe/i }).click();
  await expect(page).toHaveURL(new RegExp(`/booking/success\\?booking_id=${BOOKING_ID}`), {
    timeout: 15_000,
  });

  expect(postedCheckout).toEqual({
    packageId: PACKAGE_ID,
    items: [
      {
        itemType: 'activity_schedule',
        referenceId: SCHEDULE_A,
        quantity: PARTICIPANTS,
      },
      {
        itemType: 'activity_schedule',
        referenceId: SCHEDULE_B,
        quantity: PARTICIPANTS,
      },
    ],
  });

  await expect(page.getByText(/reservation confirmee/i)).toBeVisible();
  await expect(page.getByText(/booking id:/i)).toBeVisible();
});
