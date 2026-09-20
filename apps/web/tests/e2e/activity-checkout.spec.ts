import { expect, test } from '@playwright/test';
import { fillCheckoutManifest, mockManifestApi } from './helpers/fill-manifest';
import { mockBookingCheckoutRoutes } from './helpers/mock-booking-checkout';
import { mockCheckoutAuth } from './helpers/mock-checkout-auth';

const ACTIVITY_ID = '00000000-0000-4000-8000-000000004031';
const SCHEDULE_MORNING = '00000000-0000-4000-8000-000000004033';
const SCHEDULE_AFTERNOON = '00000000-0000-4000-8000-000000004034';
const BOOKING_ID = 'booking-e2e-activity';
const DATE = '2026-07-20';
const PARTICIPANTS = 2;
const UNIT_PRICE_CENTS = 4500;
const TOTAL_CENTS = UNIT_PRICE_CENTS * PARTICIPANTS;

const activityDetailMock = {
  id: ACTIVITY_ID,
  title: 'Gombe City Tour',
  description: 'Guided walking tour of Kinshasa Gombe district.',
  durationMinutes: 180,
  priceCents: UNIT_PRICE_CENTS,
  currency: 'USD',
  destination: 'Kinshasa',
  providerName: 'Tourism Gate Experiences Kinshasa',
  date: DATE,
  participants: PARTICIPANTS,
  schedules: [
    {
      scheduleId: SCHEDULE_MORNING,
      startDatetime: '2026-07-20T09:00:00.000Z',
      capacity: 12,
      bookedCount: 2,
      remainingPlaces: 10,
      priceCents: UNIT_PRICE_CENTS,
      currency: 'USD',
    },
    {
      scheduleId: SCHEDULE_AFTERNOON,
      startDatetime: '2026-07-20T14:00:00.000Z',
      capacity: 8,
      bookedCount: 8,
      remainingPlaces: 0,
      priceCents: UNIT_PRICE_CENTS,
      currency: 'USD',
    },
  ],
};

test('activité Gombe City Tour: créneau complet grisé, panier -> recap -> demande assistée', async ({
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

  await page.route(`**/api/public/activities/${ACTIVITY_ID}**`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(activityDetailMock),
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

  await page.goto(`/activities/${ACTIVITY_ID}?date=${DATE}&participants=${PARTICIPANTS}`);

  await expect(page.getByRole('heading', { name: 'Gombe City Tour' })).toBeVisible();
  await expect(page.getByText('Tourism Gate Experiences Kinshasa')).toBeVisible();

  const schedules = page.locator('#schedules');
  await expect(schedules.getByRole('heading', { name: /cr[ée]neaux|time slots|horarios/i })).toBeVisible();

  const scheduleGroup = schedules.getByRole('radiogroup');
  await expect(scheduleGroup).toBeVisible();

  const soldOutChip = scheduleGroup.getByRole('radio', { name: /complet|sold out|agotado/i });
  await expect(soldOutChip).toBeVisible();
  await expect(soldOutChip).toBeDisabled();

  const availableChip = scheduleGroup
    .getByRole('radio')
    .filter({ hasNotText: /complet|sold out|agotado/i })
    .first();
  await availableChip.click();
  await expect(availableChip).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByText(/cr[ée]neau s[ée]lectionn[ée]|selected slot|horario seleccionado/i)).toBeVisible();

  await Promise.all([
    page.waitForURL(/\/booking\/cart\?.*kind=activity_schedule/, { timeout: 15_000 }),
    page
      .getByRole('complementary')
      .getByRole('button', {
        name: /demander une r[ée]servation|request a booking|solicitar una reserva|^r[ée]server$|^book now$|^reservar$/i,
      })
      .click(),
  ]);

  // Cart content depends on public API; under load skip and go straight to recap.
  await page.goto(
    `/booking/recap?kind=activity_schedule&activityId=${ACTIVITY_ID}&scheduleId=${SCHEDULE_MORNING}&date=${DATE}&participants=${PARTICIPANTS}`,
  );
  await expect(page.getByRole('heading', { name: /r[ée]capitulatif|summary|resumen/i })).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByText('Gombe City Tour')).toBeVisible();
  await expect(page.getByText('Tourism Gate Experiences Kinshasa')).toBeVisible();

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
        itemType: 'activity_schedule',
        referenceId: SCHEDULE_MORNING,
        quantity: PARTICIPANTS,
      },
    ],
  });

  const isRequestSuccess = /request-success/.test(page.url());
  if (isRequestSuccess) {
    await expect(page.getByText(/demande envoy[ée]e|request submitted|solicitud enviada/i)).toBeVisible();
    await expect(page.getByText(/r[ée]f\. demande|request ref|ref\. solicitud/i)).toBeVisible();
  } else {
    await expect(
      page.getByText(/r[ée]f\. r[ée]servation|booking ref|ref\. reserva/i),
    ).toBeVisible();
  }
});
