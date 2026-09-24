import { expect, test } from '@playwright/test';
import { fillCheckoutManifest, mockManifestApi } from './helpers/fill-manifest';
import { mockBookingCheckoutRoutes } from './helpers/mock-booking-checkout';
import { mockCheckoutAuth } from './helpers/mock-checkout-auth';
import { mockTestHotelDetail } from './helpers/mock-hotel-detail';
import { mockWebPaymentMethods } from './helpers/mock-web-payment-methods';

test('panier -> recap -> Stripe -> confirmation', async ({ page }) => {
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

  await mockTestHotelDetail(page);

  let postedCheckout: unknown = null;
  await mockBookingCheckoutRoutes(page, {
    bookingId: 'booking-e2e',
    totalCents: 120000,
    onPosted: (body) => {
      postedCheckout = body;
    },
  });
  await mockManifestApi(page);

  await page.goto(
    '/hotels/test-hotel?checkIn=2026-11-10&checkOut=2026-11-12&guests=2&roomId=room-e2e',
  );

  await page
    .getByRole('button', { name: /choisir cette chambre|select this room|elegir esta habitaci[oó]n/i })
    .click();
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
  await page
    .getByRole('button', {
      name: /payer avec stripe|pay with stripe|pagar con stripe|demander une r[ée]servation|request a booking|solicitar una reserva/i,
    })
    .click();
  await expect(page).toHaveURL(
    /\/booking\/(success\?booking_id=booking-e2e|request-success\?booking_id=booking-e2e)/,
    { timeout: 15_000 },
  );

  expect(postedCheckout).toMatchObject({ preferredPaymentMethod: 'stripe' });
});

test('panier -> recap -> cash -> attente paiement sur place', async ({ page }) => {
  test.setTimeout(60_000);
  // PR-08: cash web is off by default — enable explicitly for this scenario.
  await mockWebPaymentMethods(page, { cash: true });
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

  await mockTestHotelDetail(page);

  let postedCheckout: unknown = null;
  await mockBookingCheckoutRoutes(page, {
    bookingId: 'booking-e2e-cash',
    totalCents: 120000,
    onPosted: (body) => {
      postedCheckout = body;
    },
  });
  await mockManifestApi(page);

  await page.goto(
    '/hotels/test-hotel?checkIn=2026-11-10&checkOut=2026-11-12&guests=2&roomId=room-e2e',
  );

  await page
    .getByRole('button', { name: /choisir cette chambre|select this room|elegir esta habitaci[oó]n/i })
    .click();
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

  const cashRadio = page.locator('input[name="preferredPaymentMethod"][value="cash"]');
  await expect(cashRadio).toBeVisible();
  await cashRadio.check();
  await fillCheckoutManifest(page);
  await page
    .getByRole('button', {
      name: /confirmer — paiement sur place|confirm — pay on site|confirmar — pago en efectivo|demander une r[ée]servation|request a booking|solicitar una reserva/i,
    })
    .click();
  await expect(page).toHaveURL(
    /\/booking\/(success\?booking_id=booking-e2e-cash&payment=cash|request-success\?booking_id=booking-e2e-cash)/,
    { timeout: 15_000 },
  );

  expect(postedCheckout).toMatchObject({ preferredPaymentMethod: 'cash' });
});
