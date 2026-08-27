import { expect, test } from '@playwright/test';

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

  await page.route('**/api/bookings/request', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }

    postedItems = route.request().postDataJSON();

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

  await page.locator('button:visible', { hasText: /r[ée]server|book now|reservar/i }).first().click();
  await expect(page).toHaveURL(/\/booking\/cart\?.*kind=activity_schedule/);
  await expect(page.getByText('Gombe City Tour')).toBeVisible();
  await expect(page.getByText('Tourism Gate Experiences Kinshasa')).toBeVisible();

  await page.goto(
    `/booking/recap?kind=activity_schedule&activityId=${ACTIVITY_ID}&scheduleId=${SCHEDULE_MORNING}&date=${DATE}&participants=${PARTICIPANTS}`,
  );
  await expect(page.getByRole('heading', { name: /recapitulatif/i })).toBeVisible();
  await expect(page.getByText('Gombe City Tour')).toBeVisible();
  await expect(page.getByText('Tourism Gate Experiences Kinshasa')).toBeVisible();

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

  await expect(page.getByText(/demande envoy[ée]e|request submitted|solicitud enviada/i)).toBeVisible();
  await expect(page.getByText(/r[ée]f\. demande|request ref|ref\. solicitud/i)).toBeVisible();
});
