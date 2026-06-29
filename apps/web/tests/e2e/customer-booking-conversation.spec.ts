import { expect, test } from '@playwright/test';

const USER_ID = 'user-e2e-account';
const BOOKING_ID = 'bbbb2222-3333-4444-5555-666677778888';

function mockSession(page: import('@playwright/test').Page) {
  return page.addInitScript(() => {
    window.sessionStorage.setItem(
      'atg.web.session',
      JSON.stringify({
        accessToken: 'e2e-account-token',
        refreshToken: 'e2e-account-refresh',
        expiresAt: Date.now() + 60 * 60 * 1000,
        user: {
          id: 'user-e2e-account',
          email: 'client.e2e@example.com',
          firstName: 'Client',
          lastName: 'E2E',
          organizationId: null,
          status: 'active',
        },
      }),
    );
  });
}

const bookingDetailMock = {
  booking: {
    id: BOOKING_ID,
    userId: USER_ID,
    status: 'pending_approval',
    totalCents: 9000,
    currency: 'USD',
    promoCodeId: null,
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: null,
  },
  items: [
    {
      id: 'item-1',
      bookingId: BOOKING_ID,
      itemType: 'activity_schedule',
      referenceId: 'sched-1',
      titleSnapshot: 'Gombe City Tour',
      quantity: 2,
      unitPriceCents: 4500,
      startDate: '2026-07-20',
      endDate: null,
      createdAt: '2026-03-01T10:00:00.000Z',
    },
  ],
  totalCents: 9000,
  currency: 'USD',
  review: null,
  canReview: false,
  paymentInvited: false,
  statusHistory: [
    {
      id: 'hist-1',
      bookingId: BOOKING_ID,
      fromStatus: null,
      toStatus: 'pending_approval',
      reason: null,
      changedByUserId: null,
      createdAt: '2026-03-01T10:00:00.000Z',
    },
  ],
};

test('assisted booking chat: read thread and send customer message', async ({ page }) => {
  await mockSession(page);

  let messages = [
    {
      id: 'msg-1',
      bookingId: BOOKING_ID,
      userId: 'staff-1',
      body: 'Bonjour, nous étudions votre demande.',
      isStaff: true,
      createdAt: '2026-03-01T11:00:00.000Z',
    },
  ];

  await page.route(`**/api/bookings/${BOOKING_ID}`, async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(bookingDetailMock),
    });
  });

  await page.route(`**/api/bookings/${BOOKING_ID}/messages**`, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ messages }),
      });
      return;
    }
    if (route.request().method() === 'POST') {
      const payload = route.request().postDataJSON() as { body: string };
      const created = {
        id: 'msg-2',
        bookingId: BOOKING_ID,
        userId: USER_ID,
        body: payload.body,
        isStaff: false,
        createdAt: '2026-03-01T12:00:00.000Z',
      };
      messages = [...messages, created];
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(created),
      });
      return;
    }
    await route.continue();
  });

  await page.goto(`/account/reservations/${BOOKING_ID}/chat`);

  await expect(page.getByRole('heading', { name: /conversation/i })).toBeVisible();
  await expect(page.getByText('Bonjour, nous étudions votre demande.')).toBeVisible();
  await expect(page.getByText(/demande envoy[ée]e|request submitted|solicitud enviada/i)).toBeVisible();

  const reply = 'Merci, voici nos disponibilités.';
  await page.getByPlaceholder(/[ée]crivez votre message|write your message|escriba su mensaje/i).fill(reply);
  await page.getByRole('button', { name: /envoyer|send/i }).click();

  await expect(page.getByText(reply)).toBeVisible();
});

test('assisted booking: proceed to payment only after invite', async ({ page }) => {
  await mockSession(page);

  await page.route(`**/api/bookings/${BOOKING_ID}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ...bookingDetailMock,
        booking: {
          ...bookingDetailMock.booking,
          status: 'pending_payment',
        },
        paymentInvited: true,
        statusHistory: [
          ...bookingDetailMock.statusHistory,
          {
            id: 'hist-2',
            bookingId: BOOKING_ID,
            fromStatus: 'pending_approval',
            toStatus: 'pending_payment',
            reason: 'Approved',
            changedByUserId: 'staff-1',
            createdAt: '2026-03-02T09:00:00.000Z',
          },
        ],
      }),
    });
  });

  await page.route(`**/api/bookings/${BOOKING_ID}/messages**`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ messages: [] }),
    });
  });

  await page.goto(`/account/reservations/${BOOKING_ID}`);

  await expect(
    page.getByRole('button', { name: /proc[ée]der au paiement|proceed to payment|proceder al pago/i }),
  ).toBeVisible();
});
