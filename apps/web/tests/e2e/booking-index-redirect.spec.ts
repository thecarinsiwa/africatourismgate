import { expect, test } from './fixtures';
import { E2E_HOTEL_ID, E2E_ROOM_ID } from './helpers/mock-hotel-detail';

test('WEB-003: /booking without draft redirects to /hotels', async ({ page }) => {
  await page.goto('/booking');
  await expect(page).toHaveURL(/\/hotels\/?(\?|$)/, { timeout: 15_000 });
  await expect(page.getByText(/being finalized|Booking Checkout/i)).toHaveCount(0);
});

test('WEB-003: /booking with room draft redirects to /booking/cart', async ({ page }) => {
  await page.goto(
    `/booking?propertyId=${E2E_HOTEL_ID}&roomId=${E2E_ROOM_ID}&checkIn=2026-08-10&checkOut=2026-08-12&guests=2`,
  );
  await expect(page).toHaveURL(/\/booking\/(cart|login)/, { timeout: 15_000 });
  expect(page.url()).toContain(`propertyId=${E2E_HOTEL_ID}`);
  expect(page.url()).toContain(`roomId=${E2E_ROOM_ID}`);
  await expect(page.getByText(/being finalized|Booking Checkout/i)).toHaveCount(0);
});
