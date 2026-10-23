import { expect, test, type Page } from './fixtures';

const USER_ID = 'user-e2e-i18n-account';
const BOOKING_ID = 'bbbb2222-3333-4444-5555-666677778888';
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3002';

const COPY = {
  fr: {
    accountTitle: 'Mon compte',
    nav: {
      profile: 'Profil',
      addresses: 'Adresses',
      reservations: 'Réservations',
      loyalty: 'Fidélité OneKey',
      paymentMethods: 'Moyens de paiement',
    },
    profileHeading: 'Profil',
    addressesEmpty: 'Aucune adresse enregistrée.',
    bookingsHeading: 'Réservations',
    statusPendingApproval: 'En attente de validation',
    statusConfirmed: 'Confirmée',
    actionRequired: 'Action requise',
    timelineTitle: 'Suivi de la réservation',
    timelineRequest: 'Demande envoyée',
    timelineValidation: 'Validation par l\'équipe',
    chatPlaceholder: /écrivez votre message/i,
    chatSend: 'Envoyer',
    loyaltyTitle: 'Fidélité OneKey',
    loyaltyPoints: /points OneKey/i,
    loyaltyTier: 'Argent',
    paymentEmpty: 'Aucun moyen de paiement enregistré.',
    leaveReview: 'Laisser un avis',
  },
  en: {
    accountTitle: 'My account',
    nav: {
      profile: 'Profile',
      addresses: 'Addresses',
      reservations: 'Bookings',
      loyalty: 'OneKey loyalty',
      paymentMethods: 'Payment methods',
    },
    profileHeading: 'Profile',
    addressesEmpty: 'No saved addresses.',
    bookingsHeading: 'Bookings',
    statusPendingApproval: 'Awaiting validation',
    statusConfirmed: 'Confirmed',
    actionRequired: 'Action required',
    timelineTitle: 'Booking progress',
    timelineRequest: 'Request submitted',
    timelineValidation: 'Team validation',
    chatPlaceholder: /write your message/i,
    chatSend: 'Send',
    loyaltyTitle: 'OneKey loyalty',
    loyaltyPoints: /OneKey points/i,
    loyaltyTier: 'Silver',
    paymentEmpty: 'No payment methods saved.',
    leaveReview: 'Leave a review',
  },
  es: {
    accountTitle: 'Mi cuenta',
    nav: {
      profile: 'Perfil',
      addresses: 'Direcciones',
      reservations: 'Reservas',
      loyalty: 'Fidelidad OneKey',
      paymentMethods: 'Métodos de pago',
    },
    profileHeading: 'Perfil',
    addressesEmpty: 'No hay direcciones guardadas.',
    bookingsHeading: 'Reservas',
    statusPendingApproval: 'Pendiente de validación',
    statusConfirmed: 'Confirmada',
    actionRequired: 'Acción requerida',
    timelineTitle: 'Seguimiento de la reserva',
    timelineRequest: 'Solicitud enviada',
    timelineValidation: 'Validación del equipo',
    chatPlaceholder: /escriba su mensaje/i,
    chatSend: 'Enviar',
    loyaltyTitle: 'Fidelidad OneKey',
    loyaltyPoints: /Puntos OneKey/i,
    loyaltyTier: 'Plata',
    paymentEmpty: 'No hay métodos de pago guardados.',
    leaveReview: 'Dejar una opinión',
  },
} as const;

type Locale = keyof typeof COPY;

async function mockSession(page: Page, locale: Locale) {
  await page.addInitScript(
    ({ userId, locale: code }: { userId: string; locale: string }) => {
      window.localStorage.removeItem('atg.web.session');
      window.sessionStorage.setItem(
        'atg.web.session',
        JSON.stringify({
          accessToken: 'e2e-i18n-account-token',
          refreshToken: 'e2e-i18n-account-refresh',
          expiresAt: Date.now() + 60 * 60 * 1000,
          user: {
            id: userId,
            email: 'i18n.account@example.com',
            firstName: 'I18n',
            lastName: 'Account',
            organizationId: null,
            status: 'active',
            preferredLanguage: code,
          },
        }),
      );
      document.cookie = `atg-locale=${code};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
      try {
        localStorage.setItem('atg-locale', code);
      } catch {
        /* ignore */
      }
    },
    { userId: USER_ID, locale },
  );
}

async function setLocale(page: Page, locale: Locale) {
  await page.context().addCookies([{ name: 'atg-locale', value: locale, url: BASE_URL }]);
}

async function mockAccountApis(page: Page) {
  await page.route('**/api/auth/me', async (route) => {
    const cookie = route.request().headers().cookie ?? '';
    const match = cookie.match(/(?:^|;\s*)atg-locale=(en|es|fr)/);
    const preferredLanguage = (match?.[1] as Locale | undefined) ?? 'fr';
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: {
          id: USER_ID,
          email: 'i18n.account@example.com',
          firstName: 'I18n',
          lastName: 'Account',
          phone: null,
          preferredLanguage,
          organizationId: null,
          status: 'active',
          avatarUrl: null,
        },
        permissions: ['bookings.read'],
        isSuperAdmin: false,
      }),
    });
  });

  await page.route('**/api/addresses**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [],
        meta: { total: 0, page: 1, limit: 20, totalPages: 0 },
      }),
    });
  });

  await page.route('**/api/payment-methods**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [],
        meta: { total: 0, page: 1, limit: 20, totalPages: 0 },
      }),
    });
  });

  await page.route('**/api/loyalty-accounts**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [
          {
            id: 'loyalty-onekey',
            userId: USER_ID,
            programCode: 'ONEKEY',
            pointsBalance: 250,
            tier: 'silver',
            createdAt: '2026-01-10T10:00:00.000Z',
            updatedAt: null,
          },
        ],
        meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
      }),
    });
  });

  await page.route('**/api/bookings**', async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    if (url.includes(`/bookings/${BOOKING_ID}/messages`) && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          messages: [
            {
              id: 'msg-1',
              bookingId: BOOKING_ID,
              userId: 'staff-1',
              body: 'System: request received',
              isStaff: true,
              createdAt: '2026-03-01T11:00:00.000Z',
            },
          ],
        }),
      });
      return;
    }

    if (url.includes(`/bookings/${BOOKING_ID}`) && method === 'GET' && !url.includes('/messages')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          booking: {
            id: BOOKING_ID,
            userId: USER_ID,
            status: 'pending_approval',
            preferredPaymentMethod: 'stripe',
            totalCents: 9000,
            currency: 'USD',
            promoCodeId: null,
            createdAt: '2026-03-01T10:00:00.000Z',
            updatedAt: null,
            actionRequired: true,
          },
          items: [
            {
              id: 'item-1',
              bookingId: BOOKING_ID,
              itemType: 'activity_schedule',
              referenceId: 'sched-1',
              titleSnapshot: 'Gombe City Tour',
              quantity: 2,
              unitPriceCents: 4500,
              startDate: '2026-07-20',
              endDate: null,
              createdAt: '2026-03-01T10:00:00.000Z',
            },
          ],
          totalCents: 9000,
          currency: 'USD',
          review: null,
          canReview: true,
          paymentInvited: false,
          guideAssignments: [],
          statusHistory: [
            {
              id: 'hist-1',
              bookingId: BOOKING_ID,
              fromStatus: null,
              toStatus: 'pending_approval',
              reason: null,
              changedByUserId: null,
              createdAt: '2026-03-01T10:00:00.000Z',
            },
          ],
        }),
      });
      return;
    }

    if (method === 'GET' && /\/api\/bookings(\?|$)/.test(new URL(url).pathname.replace(/\/$/, '') + (url.includes('?') ? '?' : ''))) {
      // list endpoint
    }

    if (method === 'GET' && !url.includes(`/${BOOKING_ID}`)) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: BOOKING_ID,
              userId: USER_ID,
              status: 'pending_approval',
              totalCents: 9000,
              currency: 'USD',
              promoCodeId: null,
              createdAt: '2026-03-01T10:00:00.000Z',
              updatedAt: null,
              clientEmail: 'i18n.account@example.com',
              clientFirstName: 'I18n',
              clientLastName: 'Account',
              organizationId: null,
              actionRequired: true,
              canReview: true,
            },
            {
              id: 'cccc3333-4444-5555-6666-777788889999',
              userId: USER_ID,
              status: 'confirmed',
              totalCents: 120000,
              currency: 'USD',
              promoCodeId: null,
              createdAt: '2026-01-15T10:00:00.000Z',
              updatedAt: null,
              clientEmail: 'i18n.account@example.com',
              clientFirstName: 'I18n',
              clientLastName: 'Account',
              organizationId: null,
              actionRequired: false,
              canReview: false,
            },
          ],
          meta: { total: 2, page: 1, limit: 50, totalPages: 1 },
        }),
      });
      return;
    }

    await route.fallback();
  });
}

for (const locale of ['fr', 'en', 'es'] as const) {
  test.describe(`group E account i18n (${locale})`, () => {
    test.beforeEach(async ({ page }) => {
      await setLocale(page, locale);
      await mockSession(page, locale);
      await mockAccountApis(page);
    });

    test(`shell + 8 routes — ${locale}`, async ({ page }) => {
      const c = COPY[locale];

      // /account → profile hub
      await page.goto('/account', { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL(/\/account\/profile/, { timeout: 15_000 });
      await expect(page.getByRole('heading', { name: c.accountTitle })).toBeVisible({
        timeout: 15_000,
      });
      const nav = page.getByRole('navigation', {
        name: /Navigation du compte|Account navigation|Navegación de cuenta/i,
      });
      await expect(nav.getByRole('link', { name: c.nav.profile })).toBeVisible();
      await expect(nav.getByRole('link', { name: c.nav.addresses })).toBeVisible();
      await expect(nav.getByRole('link', { name: c.nav.reservations })).toBeVisible();
      await expect(nav.getByRole('link', { name: c.nav.loyalty })).toBeVisible();
      await expect(nav.getByRole('link', { name: c.nav.paymentMethods })).toBeVisible();

      // profile
      await page.goto('/account/profile', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { name: c.accountTitle })).toBeVisible();
      await expect(page.locator('#profile-first-name')).toHaveValue('I18n', { timeout: 15_000 });

      // addresses
      await page.goto('/account/addresses', { waitUntil: 'domcontentloaded' });
      await expect(page.getByText(c.addressesEmpty)).toBeVisible({ timeout: 15_000 });

      // reservations list — translated statuses, no raw enums
      await page.goto('/account/reservations', { waitUntil: 'domcontentloaded' });
      await expect(page.getByText(c.statusPendingApproval)).toBeVisible({ timeout: 15_000 });
      await expect(page.getByText(c.statusConfirmed)).toBeVisible();
      await expect(page.getByText(c.actionRequired)).toBeVisible();
      await expect(page.getByText(c.leaveReview).first()).toBeVisible();
      await expect(page.getByText('pending_approval')).toHaveCount(0);
      await expect(page.getByText('pending_payment')).toHaveCount(0);

      // detail — assisted timeline (5 steps)
      await page.goto(`/account/reservations/${BOOKING_ID}`, { waitUntil: 'domcontentloaded' });
      await expect(page.getByText(c.statusPendingApproval).first()).toBeVisible({ timeout: 15_000 });
      await expect(page.getByRole('heading', { name: c.timelineTitle })).toBeVisible();
      await expect(page.getByText(c.timelineRequest)).toBeVisible();
      await expect(page.getByText(c.timelineValidation)).toBeVisible();
      await expect(page.getByText('pending_approval')).toHaveCount(0);

      // chat
      await page.goto(`/account/reservations/${BOOKING_ID}/chat`, { waitUntil: 'domcontentloaded' });
      await expect(page.getByPlaceholder(c.chatPlaceholder)).toBeVisible({ timeout: 15_000 });
      await expect(page.getByRole('button', { name: c.chatSend, exact: true })).toBeVisible();
      await expect(page.getByText('System: request received')).toBeVisible();

      // loyalty OneKey
      await page.goto('/account/loyalty', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { name: c.accountTitle })).toBeVisible();
      await expect(page.getByTestId('loyalty-points-balance')).toHaveText('250', { timeout: 15_000 });
      await expect(page.getByText(c.loyaltyPoints)).toBeVisible();
      await expect(page.getByText(c.loyaltyTier)).toBeVisible();

      // payment methods
      await page.goto('/account/payment-methods', { waitUntil: 'domcontentloaded' });
      await expect(page.getByText(c.paymentEmpty)).toBeVisible({ timeout: 15_000 });
    });
  });
}
