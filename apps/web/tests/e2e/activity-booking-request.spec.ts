import { expect, test } from './fixtures';

const ACTIVITY_ID = '00000000-0000-4000-8000-000000004099';
const DATE = '2099-08-15';
const REQUEST_ID = '00000000-0000-4000-8000-00000000b001';

const soldOutDetail = {
  id: ACTIVITY_ID,
  title: 'Akagera Big Five Express',
  description: 'Full-day safari when slots reopen.',
  durationMinutes: 480,
  priceCents: 22000,
  currency: 'USD',
  destination: 'Rwanda',
  providerName: 'Tourism Gate Experiences Rwanda',
  date: DATE,
  participants: 2,
  allowBookingRequestsWhenUnavailable: true,
  schedules: [
    {
      scheduleId: '00000000-0000-4000-8000-000000004100',
      startDatetime: `${DATE}T07:00:00.000Z`,
      capacity: 8,
      bookedCount: 8,
      remainingPlaces: 0,
      priceCents: 22000,
      currency: 'USD',
    },
  ],
  images: [],
  itineraryStops: [],
};

test.describe('Activity booking request (0-slot inquiry)', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ page }) => {
    const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3002';
    await page.context().addCookies([{ name: 'atg-locale', value: 'en', url: baseURL }]);
  });

  test('shows inquiry form for sold-out activity and submits successfully', async ({ page }) => {
    await page.route(`**/api/public/activities/${ACTIVITY_ID}**`, async (route) => {
      if (route.request().method() === 'POST') {
        await route.fallback();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(soldOutDetail),
      });
    });

    let postedBody: unknown = null;
    await page.route(
      `**/api/public/activities/${ACTIVITY_ID}/booking-request`,
      async (route) => {
        postedBody = route.request().postDataJSON();
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: REQUEST_ID,
            message:
              'Your booking request has been received. Our team will contact you shortly to confirm availability.',
          }),
        });
      },
    );

    await page.goto(
      `/activities/${ACTIVITY_ID}?date=${DATE}&participants=2#booking-request`,
      { waitUntil: 'domcontentloaded' },
    );

    await expect(page.getByRole('heading', { name: 'Akagera Big Five Express' })).toBeVisible({
      timeout: 20_000,
    });

    const form = page.locator('#booking-request');
    await expect(form).toBeVisible({ timeout: 15_000 });
    await expect(form.getByText(/no slots available|aucun créneau|sin horarios/i)).toBeVisible();

    await form.locator('input[type="text"]').first().fill('Jane Doe');
    await form.locator('input[type="email"]').fill('jane@example.com');
    await form.locator('input[type="tel"]').fill('+250788123456');
    await form.locator('input[type="date"]').fill(DATE);
    await form.locator('input[type="number"]').fill('2');
    await form.locator('textarea').fill('Prefer morning departure');

    await form.getByRole('button', {
      name: /submit request|envoyer la demande|enviar solicitud/i,
    }).click();

    await expect(
      page.getByText(/booking request has been received|demande de réservation a bien été reçue|solicitud de reserva/i),
    ).toBeVisible({ timeout: 10_000 });

    expect(postedBody).toEqual(
      expect.objectContaining({
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        phone: '+250788123456',
        preferredDate: DATE,
        participants: 2,
        message: 'Prefer morning departure',
      }),
    );
  });

  test('parameterized activity URL carries noindex, follow robots meta', async ({ page }) => {
    await page.route(`**/api/public/activities/${ACTIVITY_ID}**`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...soldOutDetail,
          date: '',
          schedules: [],
        }),
      });
    });

    await page.goto(`/activities/${ACTIVITY_ID}?destination=Rwanda`, {
      waitUntil: 'domcontentloaded',
    });

    const robots = page.locator('meta[name="robots"]');
    await expect(robots).toHaveAttribute('content', /noindex/i, { timeout: 15_000 });
    await expect(robots).toHaveAttribute('content', /follow/i);

    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute(
      'href',
      new RegExp(`/activities/${ACTIVITY_ID}/?$`),
    );
  });

  test('clean activity URL does not force noindex', async ({ page }) => {
    await page.route(`**/api/public/activities/${ACTIVITY_ID}**`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...soldOutDetail,
          date: '',
          schedules: [],
        }),
      });
    });

    await page.goto(`/activities/${ACTIVITY_ID}`, { waitUntil: 'domcontentloaded' });

    const robots = page.locator('meta[name="robots"]');
    await expect(robots).toBeAttached({ timeout: 15_000 });
    const content = ((await robots.getAttribute('content')) ?? '').toLowerCase();
    expect(content).not.toContain('noindex');
    expect(content).toMatch(/\bindex\b/);
  });
});
