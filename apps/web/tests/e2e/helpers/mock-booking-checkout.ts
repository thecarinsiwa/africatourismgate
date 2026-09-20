import type { Page } from '@playwright/test';

type MockBookingCheckoutOptions = {
  bookingId: string;
  totalCents: number;
  currency?: string;
  onPosted?: (body: unknown) => void;
  /** Also mock GET /bookings/:id for success pages. */
  detailStatus?: string;
  /** Fail POST checkout-session with a user-safe API error body. */
  checkoutSessionError?: { status: number; message: string };
};

function bookingsPathEndsWith(url: string, suffix: string): boolean {
  try {
    const pathname = new URL(url).pathname.replace(/\/$/, '');
    return pathname.endsWith(suffix);
  } catch {
    return false;
  }
}

/**
 * Mock create + assisted request. Register exact `/bookings` before `/bookings/request`
 * and ignore nested paths so request/manifest are never stolen.
 */
export async function mockBookingCheckoutRoutes(
  page: Page,
  options: MockBookingCheckoutOptions,
): Promise<void> {
  const currency = options.currency ?? 'USD';
  const detailStatus = options.detailStatus ?? 'pending_approval';

  await page.route('**/api/bookings', async (route) => {
    if (
      route.request().method() !== 'POST' ||
      !bookingsPathEndsWith(route.request().url(), '/bookings')
    ) {
      await route.fallback();
      return;
    }

    options.onPosted?.(route.request().postDataJSON());
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        booking: {
          id: options.bookingId,
          userId: 'user-e2e',
          status: 'pending_payment',
          preferredPaymentMethod: 'stripe',
          totalCents: options.totalCents,
          currency,
          promoCodeId: null,
          createdAt: new Date().toISOString(),
          updatedAt: null,
        },
        items: [],
        totalCents: options.totalCents,
        currency,
      }),
    });
  });

  await page.route('**/api/bookings/request', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.fallback();
      return;
    }

    options.onPosted?.(route.request().postDataJSON());
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        bookingId: options.bookingId,
        status: 'pending_approval',
        message: 'Booking request submitted',
        totalCents: options.totalCents,
        currency,
      }),
    });
  });

  await page.route(`**/api/bookings/${options.bookingId}/checkout-session`, async (route) => {
    if (options.checkoutSessionError) {
      await route.fulfill({
        status: options.checkoutSessionError.status,
        contentType: 'application/json',
        body: JSON.stringify({ message: options.checkoutSessionError.message }),
      });
      return;
    }

    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        paymentId: `payment-${options.bookingId}`,
        sessionId: `cs_test_${options.bookingId}`,
        url: `http://127.0.0.1:3002/booking/success?booking_id=${options.bookingId}`,
        amountCents: options.totalCents,
        currency,
      }),
    });
  });

  await page.route(`**/api/bookings/${options.bookingId}`, async (route) => {
    if (!bookingsPathEndsWith(route.request().url(), `/bookings/${options.bookingId}`)) {
      await route.fallback();
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        booking: {
          id: options.bookingId,
          userId: 'user-e2e',
          status: detailStatus,
          preferredPaymentMethod: 'stripe',
          totalCents: options.totalCents,
          currency,
          promoCodeId: null,
          createdAt: new Date().toISOString(),
          updatedAt: null,
        },
        items: [],
        totalCents: options.totalCents,
        currency,
      }),
    });
  });

  await page.route(`**/api/bookings/${options.bookingId}/sync-payment`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        booking: {
          id: options.bookingId,
          userId: 'user-e2e',
          status: 'confirmed',
          preferredPaymentMethod: 'stripe',
          totalCents: options.totalCents,
          currency,
          promoCodeId: null,
          createdAt: new Date().toISOString(),
          updatedAt: null,
        },
        items: [],
        totalCents: options.totalCents,
        currency,
      }),
    });
  });
}
