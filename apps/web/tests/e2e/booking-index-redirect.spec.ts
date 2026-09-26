import { expect, test } from './fixtures';

test('WEB-003: /booking without draft redirects to /hotels', async ({ page }) => {
  await page.goto('/booking');
  await expect(page).toHaveURL(/\/hotels\/?(\?|$)/, { timeout: 15_000 });
  await expect(page.getByText(/being finalized|Booking Checkout/i)).toHaveCount(0);
});

test('WEB-003: /booking with room draft redirects to /booking/cart', async ({ page }) => {
  await page.goto(
    '/booking?propertyId=test-hotel&roomId=room-e2e&checkIn=2026-08-10&checkOut=2026-08-12&guests=2',
  );
  await expect(page).toHaveURL(/\/booking\/(cart|login)/, { timeout: 15_000 });
  expect(page.url()).toMatch(/propertyId=test-hotel/);
  expect(page.url()).toMatch(/roomId=room-e2e/);
  await expect(page.getByText(/being finalized|Booking Checkout/i)).toHaveCount(0);
});
