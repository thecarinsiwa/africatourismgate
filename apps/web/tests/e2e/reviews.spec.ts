import { expect, test } from '@playwright/test';

const USER_ID = 'user-e2e-reviews';
const PROPERTY_ID = '00000000-0000-4000-8000-000000002010';
const BOOKING_ID = 'bbbb1111-2222-3333-4444-555566667777';

function mockSession(page: import('@playwright/test').Page) {
  return page.addInitScript(() => {
    window.sessionStorage.setItem(
      'atg.web.session',
      JSON.stringify({
        accessToken: 'e2e-reviews-token',
        refreshToken: 'e2e-reviews-refresh',
        expiresAt: Date.now() + 60 * 60 * 1000,
        user: {
          id: 'user-e2e-reviews',
          email: 'reviews.e2e@example.com',
          firstName: 'Review',
          lastName: 'E2E',
          organizationId: null,
          status: 'active',
        },
      }),
    );
  });
}

function minimalPropertyDetail(overrides: Record<string, unknown> = {}) {
  return {
    id: PROPERTY_ID,
    slug: 'tourism-gate-demo-hotel',
    name: 'Tourism Gate Demo Hotel',
    description: 'Demo property for e2e.',
    propertyType: 'hotel',
    starRating: 4,
    destinationName: 'Kinshasa',
    countryCode: 'CD',
    addressLine: 'Av. du Tourisme',
    images: [
      {
        id: 'img-1',
        url: 'https://example.com/hotel.jpg',
        caption: null,
        sortOrder: 0,
      },
    ],
    amenities: [{ code: 'wifi', name: 'Wi-Fi' }],
    rooms: [
      {
        id: 'room-1',
        name: 'Standard Double',
        roomType: 'standard',
        maxGuests: 2,
        bedConfig: '1 double',
        basePriceCents: 8500,
        currency: 'USD',
        totalPriceCents: null,
        available: true,
        nightlyBreakdown: [],
      },
    ],
    stay: {
      checkIn: null,
      checkOut: null,
      nights: 0,
      guests: 2,
      minTotalCents: 8500,
      currency: 'USD',
    },
    calendarDays: [],
    averageRating: 4.5,
    reviewCount: 2,
    ...overrides,
  };
}

test('hotel detail shows guest average rating and reviews section', async ({ page }) => {
  await page.route(`**/api/public/accommodations/${PROPERTY_ID}**`, async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }
    const url = route.request().url();
    if (url.includes('/reviews')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 'review-1',
              rating: 5,
              title: 'Excellent',
              body: 'Great stay.',
              authorFirstName: 'Alice',
              createdAt: '2026-05-10T12:00:00.000Z',
            },
            {
              id: 'review-2',
              rating: 4,
              title: null,
              body: 'Very good hotel.',
              authorFirstName: 'Bob',
              createdAt: '2026-04-20T09:00:00.000Z',
            },
          ],
          meta: { total: 2, page: 1, limit: 5, totalPages: 1 },
        }),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(minimalPropertyDetail()),
    });
  });

  await page.goto(`/hotels/${PROPERTY_ID}`);
  await expect(page.getByRole('heading', { name: 'Tourism Gate Demo Hotel' })).toBeVisible();
  await expect(page.getByText('4.5').first()).toBeVisible();
  await expect(page.getByText(/2.*(avis|reviews|opiniones)/i).first()).toBeVisible();
  await expect(page.getByText('Excellent')).toBeVisible();
  await expect(page.getByText('Great stay.')).toBeVisible();
});

test('booking detail shows post-stay review form when canReview', async ({ page }) => {
  await mockSession(page);

  await page.route(`**/api/bookings/${BOOKING_ID}**`, async (route) => {
    const url = route.request().url();
    if (route.request().method() === 'GET' && !url.includes('/reviews')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          booking: {
            id: BOOKING_ID,
            userId: USER_ID,
            status: 'confirmed',
            totalCents: 18000,
            currency: 'USD',
            promoCodeId: null,
            createdAt: '2026-04-01T10:00:00.000Z',
            updatedAt: null,
          },
          items: [
            {
              id: 'item-1',
              bookingId: BOOKING_ID,
              itemType: 'room',
              referenceId: 'room-1',
              titleSnapshot: 'Standard Double',
              quantity: 1,
              unitPriceCents: 9000,
              startDate: '2026-05-01',
              endDate: '2026-05-02',
              createdAt: '2026-04-01T10:00:00.000Z',
              updatedAt: null,
            },
          ],
          totalCents: 18000,
          currency: 'USD',
          review: null,
          canReview: true,
        }),
      });
      return;
    }
    await route.continue();
  });

  await page.goto(`/account/reservations/${BOOKING_ID}`);
  await expect(page.getByText(/Laisser un avis|Leave a review|Dejar una opinión/i)).toBeVisible();
  await expect(page.getByRole('radiogroup')).toBeVisible();
});

test('booking detail submits review via POST /bookings/:id/reviews', async ({ page }) => {
  await mockSession(page);

  let postReviewCalled = false;

  await page.route(`**/api/bookings/${BOOKING_ID}**`, async (route) => {
    const url = route.request().url();
    if (route.request().method() === 'GET' && !url.includes('/reviews')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          booking: {
            id: BOOKING_ID,
            userId: USER_ID,
            status: 'confirmed',
            totalCents: 18000,
            currency: 'USD',
            promoCodeId: null,
            createdAt: '2026-04-01T10:00:00.000Z',
            updatedAt: null,
          },
          items: [
            {
              id: 'item-1',
              bookingId: BOOKING_ID,
              itemType: 'room',
              referenceId: 'room-1',
              titleSnapshot: 'Standard Double',
              quantity: 1,
              unitPriceCents: 9000,
              startDate: '2026-05-01',
              endDate: '2026-05-02',
              createdAt: '2026-04-01T10:00:00.000Z',
              updatedAt: null,
            },
          ],
          totalCents: 18000,
          currency: 'USD',
          review: null,
          canReview: true,
        }),
      });
      return;
    }
    if (route.request().method() === 'POST' && url.includes('/reviews')) {
      postReviewCalled = true;
      const body = route.request().postDataJSON() as { rating: number; title?: string };
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'review-new',
          rating: body.rating,
          title: body.title ?? null,
          body: 'E2E comment',
          authorFirstName: 'Review',
          createdAt: '2026-06-02T14:00:00.000Z',
        }),
      });
      return;
    }
    await route.continue();
  });

  await page.goto(`/account/reservations/${BOOKING_ID}`);
  await page.getByRole('radio', { name: /5 sur 5|5 out of 5|5 de 5/i }).click();
  await page.locator('#review-title').fill('E2E stay');
  await page.locator('#review-body').fill('E2E comment');
  await page.getByRole('button', { name: /Publier mon avis|Submit review|Publicar opinión/i }).click();

  await expect(page.getByText(/Votre avis|Your review|Su opinión/i)).toBeVisible();
  await expect(page.getByText('E2E stay')).toBeVisible();
  expect(postReviewCalled).toBe(true);
});
