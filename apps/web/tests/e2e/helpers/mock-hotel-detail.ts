import type { Page } from '@playwright/test';

const EMPTY_REVIEWS = {
  data: [],
  meta: { total: 0, page: 1, limit: 12, totalPages: 0 },
};

const DEFAULT_DETAIL = {
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
      nightlyBreakdown: [],
      images: [],
    },
  ],
};

/**
 * Mocks GET /public/accommodations/:id and the sibling /reviews list.
 * The detail glob alone also matches `/reviews` — without a branch, reviews
 * receive the property payload, `result.data` is undefined, and HotelReviewsSection
 * crashes (remounting the room "select" button under Playwright).
 */
export async function mockTestHotelDetail(page: Page): Promise<void> {
  await page.route('**/api/public/accommodations/test-hotel**', async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }
    if (route.request().url().includes('/reviews')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(EMPTY_REVIEWS),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(DEFAULT_DETAIL),
    });
  });
}
