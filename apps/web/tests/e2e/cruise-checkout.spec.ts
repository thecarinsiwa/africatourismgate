import { expect, test } from '@playwright/test';
import { fillCheckoutManifest, mockManifestApi } from './helpers/fill-manifest';
import { mockBookingCheckoutRoutes } from './helpers/mock-booking-checkout';
import { mockCheckoutAuth } from './helpers/mock-checkout-auth';

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

  await page.route(`**/api/public/cruises/sailings/${SAILING_ID}**`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(sailingDetailMock),
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
  await expect(
    standardCard.getByText(/s[ée]lectionn[ée]e|selected|seleccionado/i).first(),
  ).toBeVisible();
  await expect(standardCard).toHaveAttribute('aria-checked', 'true');

  await Promise.all([
    page.waitForURL(/\/booking\/cart\?.*kind=cabin/, { timeout: 15_000 }),
    page
      .getByRole('complementary')
      .getByRole('button', {
        name: /demander une r[ée]servation|request a booking|solicitar una reserva|^r[ée]server$|^book now$|^reservar$/i,
      })
      .click(),
  ]);

  await page.goto(
    `/booking/recap?kind=cabin&sailingId=${SAILING_ID}&cabinAvailabilityId=${CABIN_AVAIL_STD}&guests=2`,
  );
  await expect(page.getByRole('heading', { name: /r[ée]capitulatif|summary|resumen/i })).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByText('Kinshasa — Banana')).toBeVisible();
  await expect(page.getByText('Standard')).toBeVisible();

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
        itemType: 'cabin',
        referenceId: CABIN_AVAIL_STD,
        quantity: 1,
      },
    ],
  });
});
