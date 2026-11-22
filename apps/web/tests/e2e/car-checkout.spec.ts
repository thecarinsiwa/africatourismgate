import { expect, test } from './fixtures';
import { fillCheckoutManifest, mockManifestApi } from './helpers/fill-manifest';
import { mockBookingCheckoutRoutes } from './helpers/mock-booking-checkout';
import { mockCheckoutAuth } from './helpers/mock-checkout-auth';

/** Seed-aligned fixture IDs (same as flow.test.ts) - API fully mocked, no live DB. */
const VEHICLE_ID = '00000000-0000-4000-8000-000000004021';
const SLOT_ID = '00000000-0000-4000-8000-000000004023';
const ROUTE_ID = '00000000-0000-4000-8000-000000004024';
const TRIP_ID = '00000000-0000-4000-8000-000000004026';
const AGENCY_ID = '00000000-0000-4000-8000-000000004020';
const CATEGORY_ID = '00000000-0000-4000-8000-000000004010';
const BOOKING_ID = 'booking-e2e-car';
const TRAVEL = '2026-08-01';
const TOTAL_CENTS = 5500;
const MODEL = 'Toyota Yaris';
const ROUTE_TITLE = 'Kinshasa → Lubumbashi';
const SEATS = 1;

const vehicleSearchMock = {
  data: [
    {
      id: VEHICLE_ID,
      routeId: ROUTE_ID,
      licensePlate: 'CD-KIN-001',
      categoryName: 'Economy',
      exampleModel: MODEL,
      agencyName: 'Tourism Gate Rent Kinshasa',
      agencyAddress: 'Avenue du Commerce, Gombe, Kinshasa',
      departureCity: 'Kinshasa',
      arrivalCity: 'Lubumbashi',
      priceCents: TOTAL_CENTS,
      totalPriceCents: TOTAL_CENTS,
      currency: 'USD',
      travelDate: TRAVEL,
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
  route: {
    id: ROUTE_ID,
    departureCity: 'Kinshasa',
    arrivalCity: 'Lubumbashi',
    priceCents: TOTAL_CENTS,
    currency: 'USD',
  },
  travelDate: TRAVEL,
  priceCents: TOTAL_CENTS,
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

const vehicleTripMock = {
  id: TRIP_ID,
  vehicleId: VEHICLE_ID,
  routeId: ROUTE_ID,
  availabilityId: SLOT_ID,
  departureDatetime: '2026-08-01T09:00:00.000Z',
  createdByUserId: 'user-e2e',
  maxCapacity: 4,
  seatsReserved: SEATS,
  seatsRemaining: 3,
  status: 'open',
  priceCentsPerPerson: TOTAL_CENTS,
  currency: 'USD',
  departureCity: 'Kinshasa',
  arrivalCity: 'Lubumbashi',
  paymentClosesAt: '2026-08-01T06:00:00.000Z',
  canJoin: true,
  isMine: false,
  canEditDeparture: true,
  createdAt: '2026-07-01T00:00:00.000Z',
  updatedAt: null,
};

test('tronçon Kinshasa→Lubumbashi: liste -> fiche -> panier -> recap -> Stripe -> confirmation', async ({
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
      body: JSON.stringify([
        { id: 'dest-kin', name: 'Kinshasa', countryCode: 'CD' },
        { id: 'dest-lub', name: 'Lubumbashi', countryCode: 'CD' },
      ]),
    });
  });

  await page.route('**/api/public/vehicles/route-options**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { departureCity: 'Kinshasa', arrivalCity: 'Lubumbashi' },
      ]),
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

  await page.route('**/api/public/vehicle-trips**', async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [],
          meta: { total: 0, page: 1, limit: 20, totalPages: 0 },
        }),
      });
      return;
    }
    if (method === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(vehicleTripMock),
      });
      return;
    }
    await route.fulfill({ status: 405, body: '' });
  });

  await page.route(`**/api/public/vehicle-trips/${TRIP_ID}**`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(vehicleTripMock),
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

  await page.goto(
    `/cars?departureLocation=Kinshasa&arrivalLocation=Lubumbashi&travelDate=${TRAVEL}`,
  );

  await expect(page.getByRole('heading', { name: ROUTE_TITLE })).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByText(MODEL).first()).toBeVisible();
  await page.getByRole('link', { name: /voir d[ée]tails|view details|ver detalles/i }).click();

  await expect(page).toHaveURL(new RegExp(`/cars/${VEHICLE_ID}`), { timeout: 15_000 });
  await expect(page.getByRole('heading', { name: ROUTE_TITLE })).toBeVisible();
  await expect(page.getByText(MODEL).first()).toBeVisible();

  await Promise.all([
    page.waitForURL(/\/booking\/cart\?.*vehicleTripId=/, { timeout: 15_000 }),
    page
      .getByRole('complementary')
      .getByRole('button', {
        name: /demander une r[ée]servation|request a booking|solicitar una reserva|^r[ée]server$|^book now$|reserving seats/i,
      })
      .click(),
  ]);

  const recapQuery = new URLSearchParams({
    kind: 'vehicle',
    vehicleId: VEHICLE_ID,
    availabilitySlotId: SLOT_ID,
    routeId: ROUTE_ID,
    travelDate: TRAVEL,
    vehicleTripId: TRIP_ID,
    seats: String(SEATS),
    departureDatetime: vehicleTripMock.departureDatetime,
  }).toString();
  await page.goto(`/booking/recap?${recapQuery}`);
  await expect(page.getByRole('heading', { name: /r[ée]capitulatif|summary|resumen/i })).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByText(ROUTE_TITLE).first()).toBeVisible();
  await expect(page.getByText(MODEL).first()).toBeVisible();

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
        quantity: SEATS,
        routeId: ROUTE_ID,
        startDate: TRAVEL,
        vehicleTripId: TRIP_ID,
      },
    ],
  });
});
