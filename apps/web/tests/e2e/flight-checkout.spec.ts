import { expect, test } from './fixtures';
import { fillCheckoutManifest, mockManifestApi } from './helpers/fill-manifest';
import { mockBookingCheckoutRoutes } from './helpers/mock-booking-checkout';
import { mockCheckoutAuth } from './helpers/mock-checkout-auth';

const FLIGHT_ID = '00000000-0000-4000-8000-000000003020';
const FLIGHT_CLASS_ECO = '00000000-0000-4000-8000-000000003022';
const BOOKING_ID = 'booking-e2e-flight';
const TOTAL_CENTS = 24000;

const flightDetailMock = {
  id: FLIGHT_ID,
  flightNumber: 'KQ550',
  airlineName: 'Kenya Airways',
  airlineIataCode: 'KQ',
  departureAirport: {
    iataCode: 'FIH',
    name: "N'djili International Airport",
    city: 'Kinshasa',
    countryCode: 'CD',
  },
  arrivalAirport: {
    iataCode: 'NBO',
    name: 'Jomo Kenyatta International Airport',
    city: 'Nairobi',
    countryCode: 'KE',
  },
  departureTime: '2026-08-01T08:00:00.000Z',
  arrivalTime: '2026-08-01T14:30:00.000Z',
  durationMinutes: 390,
  departureDate: '2026-08-01',
  returnDate: null,
  passengers: 2,
  minPriceCents: 12000,
  currency: 'USD',
  classes: [
    {
      id: FLIGHT_CLASS_ECO,
      className: 'economy',
      priceCents: 12000,
      availableSeats: 50,
      totalPriceCents: TOTAL_CENTS,
    },
  ],
};

test('vol FIH→NBO: fiche -> panier -> recap -> Stripe -> confirmation', async ({ page }) => {
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

  await page.route(`**/api/public/flights/${FLIGHT_ID}**`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(flightDetailMock),
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
    `/flights/${FLIGHT_ID}?from=FIH&to=NBO&departureDate=2026-08-01&passengers=2`,
  );

  await expect(page.getByRole('heading', { name: 'KQ550' })).toBeVisible();

  await page.getByRole('button', { name: /choisir cette classe|select this class/i }).click();
  await Promise.all([
    page.waitForURL(/\/booking\/cart\?.*kind=flight_class/, { timeout: 15_000 }),
    page
      .getByRole('complementary')
      .getByRole('button', {
        name: /demander une r[ée]servation|request a booking|solicitar una reserva|^r[ée]server$|^book now$/i,
      })
      .click(),
  ]);

  await page.goto(
    `/booking/recap?kind=flight_class&flightId=${FLIGHT_ID}&flightClassId=${FLIGHT_CLASS_ECO}&departureDate=2026-08-01&passengers=2`,
  );
  await expect(page.getByRole('heading', { name: /r[ée]capitulatif|summary|resumen/i })).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByText('KQ550')).toBeVisible();

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
        itemType: 'flight_class',
        referenceId: FLIGHT_CLASS_ECO,
        quantity: 2,
        date: '2026-08-01',
      },
    ],
  });
});
