import { expect, test } from '@playwright/test';

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

  await page.route('**/api/bookings', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }

    postedItems = route.request().postDataJSON();

    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        booking: {
          id: BOOKING_ID,
          userId: 'user-e2e',
          status: 'pending_payment',
          preferredPaymentMethod: 'stripe',
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
        paymentId: 'payment-e2e-flight',
        sessionId: 'cs_test_e2e_flight',
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
          preferredPaymentMethod: 'stripe',
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
    `/flights/${FLIGHT_ID}?from=FIH&to=NBO&departureDate=2026-08-01&passengers=2`,
  );

  await expect(page.getByRole('heading', { name: 'KQ550' })).toBeVisible();

  await page.getByRole('button', { name: /choisir cette classe|select this class/i }).click();
  await page.locator('button:visible', { hasText: /r[ée]server|book now/i }).first().click();
  await expect(page).toHaveURL(/\/booking\/cart\?.*kind=flight_class/);
  await expect(page.getByText('KQ550')).toBeVisible();

  await page.goto(
    `/booking/recap?kind=flight_class&flightId=${FLIGHT_ID}&flightClassId=${FLIGHT_CLASS_ECO}&departureDate=2026-08-01&passengers=2`,
  );
  await expect(page.getByRole('heading', { name: /recapitulatif/i })).toBeVisible();
  await expect(page.getByText('KQ550')).toBeVisible();

  await page.locator('input[name="preferredPaymentMethod"][value="stripe"]').check();
  await expect(page.getByRole('button', { name: /payer avec stripe|pay with stripe|pagar con stripe/i })).toBeEnabled();
  await page.getByRole('button', { name: /payer avec stripe|pay with stripe|pagar con stripe/i }).click();
  await expect(page).toHaveURL(new RegExp(`/booking/success\\?booking_id=${BOOKING_ID}`), {
    timeout: 15_000,
  });

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

  await expect(page.getByText(/reservation confirmee/i)).toBeVisible();
  await expect(page.getByText(/booking id:/i)).toBeVisible();
});
