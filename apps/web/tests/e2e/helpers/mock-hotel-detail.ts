import type { Page } from '@playwright/test';

/** Stable UUID v4 ids — public detail routes reject non-UUID path params. */
export const E2E_HOTEL_ID = '00000000-0000-4000-8000-000000001001';
export const E2E_ROOM_ID = '00000000-0000-4000-8000-000000001002';

const EMPTY_REVIEWS = {
  data: [],
  meta: { total: 0, page: 1, limit: 12, totalPages: 0 },
};

const DEFAULT_DETAIL = {
  id: E2E_HOTEL_ID,
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
      id: E2E_ROOM_ID,
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
  await page.route(`**/api/public/accommodations/${E2E_HOTEL_ID}**`, async (route) => {
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

export function e2eHotelDetailPath(query: {
  checkIn: string;
  checkOut: string;
  guests: number | string;
  roomId?: string;
}): string {
  const params = new URLSearchParams({
    checkIn: query.checkIn,
    checkOut: query.checkOut,
    guests: String(query.guests),
    roomId: query.roomId ?? E2E_ROOM_ID,
  });
  return `/hotels/${E2E_HOTEL_ID}?${params.toString()}`;
}
