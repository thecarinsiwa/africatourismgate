import { expect, test, type Page } from './fixtures';
import { fillCheckoutManifest, mockManifestApi } from './helpers/fill-manifest';
import { mockBookingCheckoutRoutes } from './helpers/mock-booking-checkout';
import { mockCheckoutAuth } from './helpers/mock-checkout-auth';
import { mockBookingModes } from './helpers/mock-booking-modes';
import { mockTestHotelDetail } from './helpers/mock-hotel-detail';

const SAFE_PAYMENT_ERROR = 'Unable to start payment. Please try again.';

async function seedCheckoutSession(page: Page): Promise<void> {
  await mockCheckoutAuth(page);
  await mockBookingModes(page);
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

  await mockTestHotelDetail(page);
  await mockManifestApi(page);
}

async function navigateHotelToRecap(page: Page): Promise<void> {
  await page.goto(
    '/hotels/test-hotel?checkIn=2026-11-10&checkOut=2026-11-12&guests=2&roomId=room-e2e',
  );

  const selectRoom = page
    .getByRole('button', {
      name: /choisir cette chambre|select this room|elegir esta habitaci[oó]n/i,
    })
    .first();
  await expect(selectRoom).toBeVisible({ timeout: 15_000 });
  await selectRoom.click();
  await Promise.all([
    page.waitForURL(/\/booking\/cart\?/),
    page
      .locator('button:visible', {
        hasText:
          /demander une r[ée]servation|request a booking|solicitar una reserva|r[ée]server|book now/i,
      })
      .first()
      .click(),
  ]);

  const continueLink = page.getByRole('link', { name: /continuer vers r[ée]cap/i });
  await expect(continueLink).toHaveAttribute('href', /\/booking\/recap\?/);
  await Promise.all([page.waitForURL(/\/booking\/recap\?/), continueLink.click()]);

  await page.locator('input[name="preferredPaymentMethod"][value="stripe"]').check();
  await fillCheckoutManifest(page);

  // Client override applies after mount — wait for immediate Stripe CTA.
  await expect(payWithStripeButton(page)).toBeVisible({ timeout: 15_000 });
}

function payWithStripeButton(page: Page) {
  return page.getByRole('button', {
    name: /payer avec stripe|pay with stripe|pagar con stripe/i,
  });
}

/** StripePaymentError only — excludes Next.js `#__next-route-announcer__` (also role=alert). */
function stripePaymentErrorAlert(page: Page) {
  return page.locator('[role="alert"]:not(#__next-route-announcer__)').filter({
    hasText: /Paiement refusé|Payment declined|Pago rechazado/i,
  });
}

test('checkout-session failure shows StripePaymentError without technical leak', async ({
  page,
}) => {
  test.setTimeout(60_000);
  await seedCheckoutSession(page);

  await mockBookingCheckoutRoutes(page, {
    bookingId: 'booking-e2e-stripe-err',
    totalCents: 120000,
    checkoutSessionError: {
      status: 502,
      message: SAFE_PAYMENT_ERROR,
    },
  });

  await navigateHotelToRecap(page);
  await payWithStripeButton(page).click();

  await expect(page).toHaveURL(/\/booking\/recap\?/, { timeout: 15_000 });

  const alert = stripePaymentErrorAlert(page);
  await expect(alert).toBeVisible();
  await expect(alert).toContainText(SAFE_PAYMENT_ERROR);
  await expect(alert).toContainText(
    /Vérifiez votre carte|Check your card|Compruebe su tarjeta/i,
  );
  await expect(alert).not.toContainText(/HTTP 502|Internal Server Error|stack|at Object\./i);
  await expect(
    alert.getByRole('button', { name: /Fermer|Dismiss|Cerrar/i }),
  ).toBeVisible();
});

test('dismiss StripePaymentError then retry checkout succeeds', async ({ page }) => {
  test.setTimeout(60_000);
  await seedCheckoutSession(page);

  const bookingId = 'booking-e2e-stripe-retry';
  await mockBookingCheckoutRoutes(page, {
    bookingId,
    totalCents: 120000,
  });

  let checkoutAttempts = 0;
  await page.route(`**/api/bookings/${bookingId}/checkout-session`, async (route) => {
    checkoutAttempts += 1;
    if (checkoutAttempts === 1) {
      await route.fulfill({
        status: 502,
        contentType: 'application/json',
        body: JSON.stringify({ message: SAFE_PAYMENT_ERROR }),
      });
      return;
    }
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        paymentId: `payment-${bookingId}`,
        sessionId: `cs_test_${bookingId}`,
        url: `/booking/success?booking_id=${bookingId}`,
        amountCents: 120000,
        currency: 'USD',
      }),
    });
  });

  await navigateHotelToRecap(page);
  await payWithStripeButton(page).click();

  const alert = stripePaymentErrorAlert(page);
  await expect(alert).toBeVisible({ timeout: 15_000 });
  await alert.getByRole('button', { name: /Fermer|Dismiss|Cerrar/i }).click();
  await expect(alert).toHaveCount(0);

  await Promise.all([
    page.waitForURL(new RegExp(`/booking/success\\?booking_id=${bookingId}`), {
      timeout: 15_000,
    }),
    payWithStripeButton(page).click(),
  ]);

  expect(checkoutAttempts).toBe(2);
});
