import { expect, test } from '@playwright/test';

test('panier -> recap -> Stripe -> confirmation', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
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

  await page.route('**/api/public/accommodations/test-hotel**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'test-hotel',
        name: 'Hotel Test Kinshasa',
        propertyType: 'hotel',
        destinationName: 'Kinshasa',
        addressLine: '1 Avenue Test',
        description: 'Hotel for e2e.',
        starRating: 4,
        images: [],
        amenities: [],
        stay: {
          nights: 2,
          minTotalCents: 120000,
          currency: 'USD',
        },
        calendarDays: [],
        rooms: [
          {
            id: 'room-e2e',
            name: 'Suite E2E',
            maxGuests: 2,
            bedConfig: '1 king bed',
            basePriceCents: 60000,
            totalPriceCents: 120000,
            currency: 'USD',
            available: true,
          },
        ],
      }),
    });
  });

  await page.route('**/api/bookings', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        booking: {
          id: 'booking-e2e',
          userId: 'user-e2e',
          status: 'pending_payment',
          totalCents: 120000,
          currency: 'USD',
          promoCodeId: null,
          createdAt: new Date().toISOString(),
          updatedAt: null,
        },
        items: [],
        totalCents: 120000,
        currency: 'USD',
      }),
    });
  });

  await page.route('**/api/bookings/booking-e2e/checkout-session', async (route) => {
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        paymentId: 'payment-e2e',
        sessionId: 'cs_test_e2e',
        url: 'http://127.0.0.1:3002/booking/success?booking_id=booking-e2e',
        amountCents: 120000,
        currency: 'USD',
      }),
    });
  });

  await page.route('**/api/bookings/booking-e2e', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        booking: {
          id: 'booking-e2e',
          userId: 'user-e2e',
          status: 'confirmed',
          totalCents: 120000,
          currency: 'USD',
          promoCodeId: null,
          createdAt: new Date().toISOString(),
          updatedAt: null,
        },
        items: [],
        totalCents: 120000,
        currency: 'USD',
      }),
    });
  });

  await page.goto(
    '/hotels/test-hotel?checkIn=2026-08-10&checkOut=2026-08-12&guests=2&roomId=room-e2e',
  );

  await page.locator('button:visible', { hasText: /reserver|réserver|book now/i }).first().click();
  await expect(page).toHaveURL(/\/booking\/cart\?/);

  await page.getByRole('link', { name: /continuer vers r[ée]cap/i }).click();
  await expect(page).toHaveURL(/\/booking\/recap\?/);

  await page.getByRole('button', { name: /payer avec stripe/i }).click();
  await expect(page).toHaveURL(/\/booking\/success\?booking_id=booking-e2e/);

  await expect(page.getByText(/reservation confirmee/i)).toBeVisible();
  await expect(page.getByText(/booking id:/i)).toBeVisible();
});
