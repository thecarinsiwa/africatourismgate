import { expect, test } from '@playwright/test';

const SAILING_ID = '00000000-0000-4000-8000-000000003036';
const CABIN_AVAIL_STD = '00000000-0000-4000-8000-000000003037';
const CABIN_AVAIL_SUITE = '00000000-0000-4000-8000-000000003038';
const BOOKING_ID = 'booking-e2e-cruise';
const TOTAL_CENTS = 245000;

const sailingDetailMock = {
  id: SAILING_ID,
  departureDate: '2026-09-15',
  returnDate: '2026-09-20',
  durationNights: 5,
  itineraryName: 'Kinshasa — Banana',
  shipName: 'Congo River Spirit',
  cruiseLineName: 'Africa River Cruises',
  sailFromPortCode: 'CDKIN',
  sailFromPortName: 'Kinshasa Port',
  sailToPortCode: 'CDBNW',
  sailToPortName: 'Banana Port',
  minPriceCents: TOTAL_CENTS,
  currency: 'USD',
  itineraryPorts: [
    {
      dayNumber: 1,
      portCode: 'CDKIN',
      portName: 'Kinshasa Port',
      countryCode: 'CD',
      arrivalTime: null,
      departureTime: '18:00:00',
    },
    {
      dayNumber: 4,
      portCode: 'CDBNW',
      portName: 'Banana Port',
      countryCode: 'CD',
      arrivalTime: '10:00:00',
      departureTime: null,
    },
  ],
  cabins: [
    {
      availabilityId: CABIN_AVAIL_STD,
      cabinId: '00000000-0000-4000-8000-000000003034',
      categoryName: 'Standard',
      maxGuests: 2,
      priceCents: TOTAL_CENTS,
      availableCount: 8,
      currency: 'USD',
    },
    {
      availabilityId: CABIN_AVAIL_SUITE,
      cabinId: '00000000-0000-4000-8000-000000003035',
      categoryName: 'Suite',
      maxGuests: 4,
      priceCents: 440000,
      availableCount: 0,
      currency: 'USD',
    },
  ],
};

test('croisière CDKIN→CDBNW: itinéraire, cabine grisée, panier -> recap -> Stripe', async ({
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

  await page.route(`**/api/public/cruises/sailings/${SAILING_ID}**`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(sailingDetailMock),
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
        paymentId: 'payment-e2e-cruise',
        sessionId: 'cs_test_e2e_cruise',
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

  await page.goto(`/cruises/${SAILING_ID}?guests=2`);

  await expect(page.getByRole('heading', { name: 'Kinshasa — Banana' })).toBeVisible();

  const itinerary = page.locator('section').filter({
    has: page.getByRole('heading', { name: /itinéraire|itinerary|itinerario/i }),
  });
  await expect(itinerary.locator('ol').getByText('CDKIN — Kinshasa Port')).toBeVisible();
  await expect(itinerary.locator('ol').getByText('CDBNW — Banana Port')).toBeVisible();

  const suiteCard = page.locator('article').filter({ hasText: 'Suite' });
  await expect(suiteCard.getByText(/complet|sold out|agotado/i)).toBeVisible();
  await expect(
    suiteCard.getByRole('button', { name: /choisir cette cabine|select this cabin|elegir este camarote/i }),
  ).toBeDisabled();

  const standardCard = page.locator('article').filter({ hasText: 'Standard' });
  await standardCard
    .getByRole('button', { name: /choisir cette cabine|select this cabin|elegir este camarote/i })
    .click();

  await page.locator('button:visible', { hasText: /r[ée]server|book now|reservar/i }).first().click();
  await expect(page).toHaveURL(/\/booking\/cart\?.*kind=cabin/);
  await expect(page.getByText('Kinshasa — Banana')).toBeVisible();
  await expect(page.getByText('Standard')).toBeVisible();

  await page.goto(
    `/booking/recap?kind=cabin&sailingId=${SAILING_ID}&cabinAvailabilityId=${CABIN_AVAIL_STD}&guests=2`,
  );
  await expect(page.getByRole('heading', { name: /recapitulatif/i })).toBeVisible();
  await expect(page.getByText('Kinshasa — Banana')).toBeVisible();
  await expect(page.getByText('Standard')).toBeVisible();

  await expect(page.getByRole('button', { name: /payer avec stripe/i })).toBeEnabled();
  await page.getByRole('button', { name: /payer avec stripe/i }).click();
  await expect(page).toHaveURL(new RegExp(`/booking/success\\?booking_id=${BOOKING_ID}`), {
    timeout: 15_000,
  });

  expect(postedItems).toEqual({
    items: [
      {
        itemType: 'cabin',
        referenceId: CABIN_AVAIL_STD,
        quantity: 1,
      },
    ],
  });

  await expect(page.getByText(/reservation confirmee/i)).toBeVisible();
  await expect(page.getByText(/booking id:/i)).toBeVisible();
});
