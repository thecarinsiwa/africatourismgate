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

  const continueLink = page.getByRole('link', {
    name: /continuer vers r[ée]cap|continue to summary|continuar al resumen/i,
  });
  await expect(continueLink).toHaveAttribute('href', /\/booking\/recap\?/, {
    timeout: 15_000,
  });
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

async function clickPayAndAwaitCheckoutSession(
  page: Page,
  bookingId: string,
  mode: 'response' | 'abort' = 'response',
): Promise<void> {
  const urlPart = `/bookings/${bookingId}/checkout-session`;
  const settled =
    mode === 'abort'
      ? page.waitForEvent('requestfailed', {
          predicate: (req) =>
            req.method() === 'POST' && req.url().includes(urlPart),
          timeout: 20_000,
        })
      : page.waitForResponse(
          (res) =>
            res.request().method() === 'POST' && res.url().includes(urlPart),
          { timeout: 20_000 },
        );
  await payWithStripeButton(page).click();
  await settled;
}

async function expectSuccessAfterRetry(page: Page, bookingId: string): Promise<void> {
  await Promise.all([
    page.waitForURL(new RegExp(`/booking/success\\?booking_id=${bookingId}`), {
      timeout: 15_000,
      waitUntil: 'commit',
    }),
    payWithStripeButton(page).click(),
  ]);
}

const STRIPE_ERROR_TITLE =
  /Paiement refusé|Payment declined|Pago rechazado|Connexion interrompue|Connection interrupted|Conexión interrumpida|Paiement impossible|Payment could not start|No se pudo iniciar el pago/i;

/** StripePaymentError only — excludes Next.js `#__next-route-announcer__` (also role=alert). */
function stripePaymentErrorAlert(page: Page) {
  return page.locator('[role="alert"]:not(#__next-route-announcer__)').filter({
    hasText: STRIPE_ERROR_TITLE,
  });
}

const TECHNICAL_LEAK =
  /HTTP 502|Internal Server Error|ECONNREFUSED|stack|at Object\.|\/app\/route\.ts/i;

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
  await clickPayAndAwaitCheckoutSession(page, 'booking-e2e-stripe-err');

  await expect(page).toHaveURL(/\/booking\/recap\?/, { timeout: 15_000 });

  const alert = stripePaymentErrorAlert(page);
  await expect(alert).toBeVisible({ timeout: 15_000 });
  await expect(alert).toContainText(SAFE_PAYMENT_ERROR);
  await expect(alert).toContainText(
    /Vérifiez votre carte|Check your card|Compruebe su tarjeta/i,
  );
  await expect(alert).not.toContainText(TECHNICAL_LEAK);
  await expect(
    alert.getByRole('button', { name: /Fermer|Dismiss|Cerrar/i }),
  ).toBeVisible();
});

test('checkout-session technical HTTP error is scrubbed from the UI', async ({ page }) => {
  test.setTimeout(90_000);
  await seedCheckoutSession(page);

  const bookingId = 'booking-e2e-stripe-tech';
  await mockBookingCheckoutRoutes(page, {
    bookingId,
    totalCents: 120000,
    checkoutSessionError: {
      status: 502,
      message: 'HTTP 502 Bad Gateway\n    at Object.handler (/app/route.ts:10:5)',
    },
  });

  await navigateHotelToRecap(page);
  await clickPayAndAwaitCheckoutSession(page, bookingId);

  const alert = stripePaymentErrorAlert(page);
  await expect(alert).toBeVisible({ timeout: 15_000 });
  await expect(alert).toContainText(
    /Paiement impossible|Payment could not start|No se pudo iniciar el pago/i,
  );
  await expect(alert).toContainText(
    /Réessayez|Try again|Reintente|panier|cart|carrito/i,
  );
  await expect(alert).not.toContainText(TECHNICAL_LEAK);
});

test('checkout-session network timeout shows i18n network error and allows retry', async ({
  page,
}) => {
  test.setTimeout(90_000);
  await seedCheckoutSession(page);

  const bookingId = 'booking-e2e-stripe-timeout';
  await mockBookingCheckoutRoutes(page, {
    bookingId,
    totalCents: 120000,
  });

  let checkoutAttempts = 0;
  await page.unroute(`**/api/bookings/${bookingId}/checkout-session`);
  await page.route(`**/api/bookings/${bookingId}/checkout-session`, async (route) => {
    checkoutAttempts += 1;
    if (checkoutAttempts === 1) {
      await route.abort('timedout');
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
  await clickPayAndAwaitCheckoutSession(page, bookingId, 'abort');

  const alert = stripePaymentErrorAlert(page);
  await expect(alert).toBeVisible({ timeout: 15_000 });
  await expect(alert).toContainText(
    /Connexion interrompue|Connection interrupted|Conexión interrumpida/i,
  );
  await expect(alert).toContainText(
    /réseau|network|red|connection|connexion|conexión/i,
  );
  await expect(alert).not.toContainText(TECHNICAL_LEAK);

  await alert.getByRole('button', { name: /Fermer|Dismiss|Cerrar/i }).click();
  await expect(alert).toHaveCount(0);

  await expectSuccessAfterRetry(page, bookingId);

  expect(checkoutAttempts).toBe(2);
});

test('dismiss StripePaymentError then retry checkout succeeds', async ({ page }) => {
  test.setTimeout(90_000);
  await seedCheckoutSession(page);

  const bookingId = 'booking-e2e-stripe-retry';
  await mockBookingCheckoutRoutes(page, {
    bookingId,
    totalCents: 120000,
  });

  let checkoutAttempts = 0;
  await page.unroute(`**/api/bookings/${bookingId}/checkout-session`);
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
  await clickPayAndAwaitCheckoutSession(page, bookingId);

  const alert = stripePaymentErrorAlert(page);
  await expect(alert).toBeVisible({ timeout: 15_000 });
  await alert.getByRole('button', { name: /Fermer|Dismiss|Cerrar/i }).click();
  await expect(alert).toHaveCount(0);

  await expectSuccessAfterRetry(page, bookingId);

  expect(checkoutAttempts).toBe(2);
});
