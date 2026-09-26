import { expect, test } from './fixtures';
import { fillCheckoutManifest, mockManifestApi } from './helpers/fill-manifest';
import { mockBookingCheckoutRoutes } from './helpers/mock-booking-checkout';
import { mockCheckoutAuth } from './helpers/mock-checkout-auth';

/** Seed-aligned fixture IDs (same as flow.test.ts) — API fully mocked, no live DB. */
const VEHICLE_ID = '00000000-0000-4000-8000-000000004021';
const SLOT_ID = '00000000-0000-4000-8000-000000004023';
const AGENCY_ID = '00000000-0000-4000-8000-000000004020';
const CATEGORY_ID = '00000000-0000-4000-8000-000000004010';
const BOOKING_ID = 'booking-e2e-car';
const PICKUP = '2026-08-01';
const RETURN = '2026-08-08';
const TOTAL_CENTS = 38_500; // 7 × 5500
const MODEL = 'Toyota Yaris';

const vehicleSearchMock = {
  data: [
    {
      id: VEHICLE_ID,
      licensePlate: 'CD-KIN-001',
      categoryName: 'Economy',
      exampleModel: MODEL,
      agencyName: 'Tourism Gate Rent Kinshasa',
      agencyAddress: 'Avenue du Commerce, Gombe, Kinshasa',
      pickupCity: 'Kinshasa',
      dailyPriceCents: 5500,
      totalPriceCents: TOTAL_CENTS,
      currency: 'USD',
      rentalDays: 7,
      pickupDate: PICKUP,
      returnDate: RETURN,
      availabilitySlotId: SLOT_ID,
      imageUrl: null,
    },
  ],
  meta: { total: 1, page: 1, limit: 50, totalPages: 1 },
};

const vehicleDetailMock = {
  id: VEHICLE_ID,
  licensePlate: 'CD-KIN-001',
  agency: {
    id: AGENCY_ID,
    name: 'Tourism Gate Rent Kinshasa',
    address: 'Avenue du Commerce, Gombe, Kinshasa',
    city: 'Kinshasa',
  },
  category: {
    id: CATEGORY_ID,
    name: 'Economy',
    exampleModel: MODEL,
  },
  pickupDate: PICKUP,
  returnDate: RETURN,
  rentalDays: 7,
  dailyPriceCents: 5500,
  totalPriceCents: TOTAL_CENTS,
  currency: 'USD',
  availabilitySlot: {
    id: SLOT_ID,
    startDatetime: '2026-08-01T08:00:00.000Z',
    endDatetime: '2026-08-31T18:00:00.000Z',
  },
  images: [],
  imageUrl: null,
};

test('location Kinshasa: liste -> fiche -> panier -> recap -> Stripe -> confirmation', async ({
  page,
}) => {
  test.setTimeout(60_000);

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

  await page.route('**/api/public/vehicles/pickup-locations**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([{ id: 'dest-kin', name: 'Kinshasa', countryCode: 'CD' }]),
    });
  });

  await page.route('**/api/public/vehicles/search**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(vehicleSearchMock),
    });
  });

  await page.route(`**/api/public/vehicles/${VEHICLE_ID}**`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(vehicleDetailMock),
    });
  });

  let postedItems: unknown = null;
  await mockBookingCheckoutRoutes(page, {
    bookingId: BOOKING_ID,
    totalCents: TOTAL_CENTS,
    detailStatus: 'confirmed',
    onPosted: (body) => {
      postedItems = body;
    },
  });
  await mockManifestApi(page);

  await page.goto(`/cars?pickupDate=${PICKUP}&returnDate=${RETURN}`);

  await expect(page.getByRole('heading', { name: MODEL })).toBeVisible({ timeout: 15_000 });
  await page.getByRole('link', { name: /voir d[ée]tails|view details|ver detalles/i }).click();

  await expect(page).toHaveURL(new RegExp(`/cars/${VEHICLE_ID}`), { timeout: 15_000 });
  await expect(page.getByRole('heading', { name: MODEL })).toBeVisible();

  await Promise.all([
    page.waitForURL(/\/booking\/cart\?.*kind=vehicle/, { timeout: 15_000 }),
    page
      .getByRole('complementary')
      .getByRole('button', {
        name: /demander une r[ée]servation|request a booking|solicitar una reserva|^r[ée]server$|^book now$/i,
      })
      .click(),
  ]);

  await page.goto(
    `/booking/recap?kind=vehicle&vehicleId=${VEHICLE_ID}&availabilitySlotId=${SLOT_ID}&pickupDate=${PICKUP}&returnDate=${RETURN}`,
  );
  await expect(page.getByRole('heading', { name: /r[ée]capitulatif|summary|resumen/i })).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByText(MODEL)).toBeVisible();

  await page.locator('input[name="preferredPaymentMethod"][value="stripe"]').check();
  await fillCheckoutManifest(page);
  const submitCta = page.getByRole('button', {
    name: /payer avec stripe|pay with stripe|pagar con stripe|demander une r[ée]servation|request a booking|solicitar una reserva/i,
  });
  await expect(submitCta).toBeEnabled();
  await Promise.all([
    page.waitForURL(
      new RegExp(`/booking/(success\\?booking_id=${BOOKING_ID}|request-success\\?booking_id=${BOOKING_ID})`),
      { timeout: 20_000, waitUntil: 'commit' },
    ),
    submitCta.click(),
  ]);

  expect(postedItems).toEqual({
    preferredPaymentMethod: 'stripe',
    items: [
      {
        itemType: 'vehicle',
        referenceId: SLOT_ID,
        quantity: 1,
        startDate: PICKUP,
        endDate: RETURN,
      },
    ],
  });
});
