/**
 * WEB-I18N-06 — automated FR → EN smoke across public (+ mocked auth) routes.
 *
 * Anchor texts are static next-intl chrome only (hero/nav/button). We do not assert
 * on CMS/API bodies (about HTML, blog posts, product titles, announcement banner).
 *
 * Run: `pnpm test:e2e -- i18n-pages`
 */
import { expect, test, type Page } from './fixtures';
import {
  assertNoCommonFrHeaderChrome,
  switchLanguage,
  type AppLocale,
} from './helpers/i18n';

const USER_ID = 'user-e2e-i18n-pages';

type RouteSmoke = {
  path: string;
  /** Comment: why this FR/EN pair is a stable chrome anchor */
  note: string;
  fr: RegExp | string;
  en: RegExp | string;
  role?: 'heading' | 'button' | 'link';
  level?: 1 | 2;
};

async function forceLocale(page: Page, locale: AppLocale) {
  await switchLanguage(page, locale);
}

async function mockSession(page: Page) {
  // Never clobber session on reload — LocaleBootstrap prefers
  // session.user.preferredLanguage over the atg-locale cookie/localStorage.
  await page.addInitScript((userId: string) => {
    let fromStorage: 'fr' | 'en' | 'es' | null = null;
    try {
      const stored = localStorage.getItem('atg-locale');
      if (stored === 'en' || stored === 'es' || stored === 'fr') {
        fromStorage = stored;
      }
    } catch {
      /* ignore */
    }

    const existingRaw = window.sessionStorage.getItem('atg.web.session');
    if (existingRaw) {
      if (fromStorage) {
        try {
          const existing = JSON.parse(existingRaw) as {
            user?: { preferredLanguage?: string };
          };
          if (existing.user && existing.user.preferredLanguage !== fromStorage) {
            existing.user.preferredLanguage = fromStorage;
            window.sessionStorage.setItem('atg.web.session', JSON.stringify(existing));
          }
        } catch {
          /* ignore */
        }
      }
      return;
    }

    window.localStorage.removeItem('atg.web.session');
    window.sessionStorage.setItem(
      'atg.web.session',
      JSON.stringify({
        accessToken: 'e2e-i18n-pages-token',
        refreshToken: 'e2e-i18n-pages-refresh',
        expiresAt: Date.now() + 60 * 60 * 1000,
        user: {
          id: userId,
          email: 'i18n.pages@example.com',
          firstName: 'I18n',
          lastName: 'Pages',
          organizationId: null,
          status: 'active',
          preferredLanguage: fromStorage ?? 'fr',
        },
      }),
    );
  }, USER_ID);

  await page.route('**/api/auth/me', async (route) => {
    if (route.request().method() !== 'GET' && route.request().method() !== 'PATCH') {
      await route.fallback();
      return;
    }
    const cookie = route.request().headers().cookie ?? '';
    const match = cookie.match(/(?:^|;\s*)atg-locale=(en|es|fr)/);
    const preferredLanguage = (match?.[1] as AppLocale | undefined) ?? 'fr';
    const user = {
      id: USER_ID,
      email: 'i18n.pages@example.com',
      firstName: 'I18n',
      lastName: 'Pages',
      phone: null,
      preferredLanguage,
      organizationId: null,
      status: 'active',
      avatarUrl: null,
    };
    if (route.request().method() === 'PATCH') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(user),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user,
        permissions: ['bookings.read'],
        isSuperAdmin: false,
      }),
    });
  });

  await page.route('**/api/auth/refresh', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        accessToken: 'e2e-i18n-pages-token',
        refreshToken: 'e2e-i18n-pages-refresh',
        expiresIn: 3600,
      }),
    });
  });

  await page.route('**/api/bookings**', async (route) => {
    if (route.request().method() !== 'GET') {
      await route.fallback();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [],
        meta: { total: 0, page: 1, limit: 50, totalPages: 0 },
      }),
    });
  });
}

/** Empty CMS so about/blog/legal chrome is next-intl-only. */
async function mockEmptyCms(page: Page) {
  await page.route('**/api/public/about-pages/**', async (route) => {
    await route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Not found' }),
    });
  });
  await page.route('**/api/public/blog**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [], meta: { total: 0, page: 1, limit: 50, totalPages: 0 } }),
    });
  });
  await page.route('**/api/public/legal-pages/**', async (route) => {
    await route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Not found' }),
    });
  });
  await page.route('**/api/public/team-members**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [], meta: { total: 0, page: 1, limit: 50, totalPages: 0 } }),
    });
  });
}

function locatorFor(page: Page, route: RouteSmoke) {
  const role = route.role ?? 'heading';
  if (role === 'heading') {
    return page.getByRole('heading', {
      name: route.fr instanceof RegExp ? route.fr : route.fr,
      level: route.level ?? 1,
    });
  }
  if (role === 'button') {
    return page.getByRole('button', {
      name: route.fr instanceof RegExp ? route.fr : route.fr,
      exact: typeof route.fr === 'string',
    });
  }
  return page.getByRole('link', {
    name: route.fr instanceof RegExp ? route.fr : route.fr,
    exact: typeof route.fr === 'string',
  });
}

function locatorEn(page: Page, route: RouteSmoke) {
  const role = route.role ?? 'heading';
  if (role === 'heading') {
    return page.getByRole('heading', {
      name: route.en instanceof RegExp ? route.en : route.en,
      level: route.level ?? 1,
    });
  }
  if (role === 'button') {
    return page.getByRole('button', {
      name: route.en instanceof RegExp ? route.en : route.en,
      exact: typeof route.en === 'string',
    });
  }
  return page.getByRole('link', {
    name: route.en instanceof RegExp ? route.en : route.en,
    exact: typeof route.en === 'string',
  });
}

async function smokeFrToEn(page: Page, route: RouteSmoke) {
  await page.goto(route.path, { waitUntil: 'domcontentloaded' });
  await forceLocale(page, 'fr');
  await expect(locatorFor(page, route)).toBeVisible({ timeout: 15_000 });

  await switchLanguage(page, 'en');
  await expect(locatorEn(page, route)).toBeVisible({ timeout: 15_000 });
  await assertNoCommonFrHeaderChrome(page);
}

test.describe('i18n pages FR → EN', () => {
  test.describe.configure({ timeout: 90_000 });

  test.describe('home', () => {
    test('home nav + why-us anchors', async ({ page }) => {
      // Anchors: nav.signIn « Connexion » → « Sign in »; whyUs title (static next-intl).
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await forceLocale(page, 'fr');
      await expect(page.getByRole('link', { name: 'Connexion', exact: true })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Pourquoi nous choisir' })).toBeVisible({
        timeout: 15_000,
      });

      await switchLanguage(page, 'en');
      await expect(page.getByRole('link', { name: 'Sign in', exact: true })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Why choose us' })).toBeVisible();
      await assertNoCommonFrHeaderChrome(page);
    });
  });

  test.describe('verticals', () => {
    const verticals: RouteSmoke[] = [
      // Anchors: *.heroTitle (listing chrome, not product CMS titles).
      {
        path: '/hotels',
        note: 'hotels.heroTitle',
        fr: "Hébergements d'exception en Afrique",
        en: 'Exceptional stays across Africa',
      },
      {
        path: '/flights',
        note: 'flights.heroTitle',
        fr: "Vols vers l'Afrique",
        en: 'Flights to Africa',
      },
      {
        path: '/cars',
        note: 'cars.heroTitle',
        fr: 'Location de voitures en Afrique',
        en: 'Car rental in Africa',
      },
      {
        path: '/cruises',
        note: 'cruises.heroTitle',
        fr: 'Croisières en Afrique',
        en: 'Cruises in Africa',
      },
      {
        path: '/activities',
        note: 'activities.heroTitle',
        fr: 'Activités en Afrique',
        en: 'Activities in Africa',
      },
      {
        path: '/packages',
        note: 'packages.heroTitle',
        fr: 'Forfaits combinés en Afrique',
        en: 'Combined packages in Africa',
      },
      {
        path: '/partners',
        note: 'partners.heroTitle',
        fr: 'Nos partenaires',
        en: 'Our partners',
      },
      {
        path: '/search/hotels',
        note: 'verticalSearch « Hébergements — Résultats » → « Hotels — Results »',
        fr: 'Hébergements — Résultats',
        en: 'Hotels — Results',
      },
    ];

    for (const route of verticals) {
      test(`${route.path} — ${route.note}`, async ({ page }) => {
        await smokeFrToEn(page, route);
      });
    }
  });

  test.describe('booking', () => {
    const bookingRoutes: RouteSmoke[] = [
      {
        path: '/booking/login',
        note: 'booking.login title',
        fr: 'Connexion client',
        en: 'Customer sign in',
      },
      {
        path: '/booking/register',
        note: 'booking.register title',
        fr: 'Créer un compte client',
        en: 'Create a customer account',
      },
      {
        path: '/booking/cancel',
        note: 'booking.cancel / checkout.cancel title',
        fr: 'Paiement annulé',
        en: 'Payment cancelled',
      },
      {
        path: '/booking/verify',
        note: 'booking.verify.defaultTitle (OTP chrome)',
        fr: 'Vérification par e-mail',
        en: 'Email verification',
      },
    ];

    for (const route of bookingRoutes) {
      test(`${route.path} — ${route.note}`, async ({ page }) => {
        await smokeFrToEn(page, route);
      });
    }

    test('/booking/cart — checkout.cartTitle (mock auth)', async ({ page }) => {
      // Anchor: checkout.cartTitle — empty cart chrome, not line-item API titles.
      await mockSession(page);
      await page.goto('/booking/cart', { waitUntil: 'domcontentloaded' });
      await forceLocale(page, 'fr');
      await expect(
        page.getByRole('heading', { name: 'Panier réservation' }),
      ).toBeVisible({ timeout: 15_000 });

      await switchLanguage(page, 'en');
      await expect(
        page.getByRole('heading', { name: 'Booking cart' }),
      ).toBeVisible({ timeout: 15_000 });
      await assertNoCommonFrHeaderChrome(page);
    });
  });

  test.describe('account (mock auth)', () => {
    test.beforeEach(async ({ page }) => {
      await mockSession(page);
    });

    test('/account/profile — account.title', async ({ page }) => {
      // Anchor: account.title « Mon compte » → « My account » (shell, not profile field values).
      await page.goto('/account/profile', { waitUntil: 'domcontentloaded' });
      await forceLocale(page, 'fr');
      await expect(page.getByRole('heading', { name: 'Mon compte' })).toBeVisible({
        timeout: 15_000,
      });

      await switchLanguage(page, 'en');
      await expect(page.getByRole('heading', { name: 'My account' })).toBeVisible({
        timeout: 15_000,
      });
      await assertNoCommonFrHeaderChrome(page);
    });

    test('/account/reservations — account.nav.reservations', async ({ page }) => {
      // Anchor: nav + empty state chrome (mocked empty list — no booking status enums).
      await page.goto('/account/reservations', { waitUntil: 'domcontentloaded' });
      await forceLocale(page, 'fr');
      await expect(page.getByRole('heading', { name: 'Mon compte' })).toBeVisible({
        timeout: 15_000,
      });
      await expect(
        page.getByText(/Aucune réservation|Mes réservations/i).first(),
      ).toBeVisible({ timeout: 15_000 });

      await switchLanguage(page, 'en');
      await expect(page.getByRole('heading', { name: 'My account' })).toBeVisible();
      await expect(page.getByText(/No bookings yet|My bookings|Bookings/i).first()).toBeVisible({
        timeout: 15_000,
      });
      await assertNoCommonFrHeaderChrome(page);
    });

    test('/account/loyalty — account.nav.loyalty', async ({ page }) => {
      await page.route('**/api/loyalty-accounts**', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [],
            meta: { total: 0, page: 1, limit: 20, totalPages: 0 },
          }),
        });
      });
      // Anchor: account.nav.loyalty / empty OneKey copy (no API tier labels required).
      await page.goto('/account/loyalty', { waitUntil: 'domcontentloaded' });
      await forceLocale(page, 'fr');
      await expect(
        page.getByRole('navigation', { name: /Navigation du compte/i }).getByRole('link', {
          name: /Fidélité OneKey/i,
        }),
      ).toBeVisible({ timeout: 15_000 });

      await switchLanguage(page, 'en');
      await expect(
        page.getByRole('navigation', { name: /Account navigation/i }).getByRole('link', {
          name: /OneKey loyalty/i,
        }),
      ).toBeVisible({ timeout: 15_000 });
      await assertNoCommonFrHeaderChrome(page);
    });
  });

  test.describe('marketing', () => {
    test.beforeEach(async ({ page }) => {
      await mockEmptyCms(page);
    });

    const marketing: RouteSmoke[] = [
      {
        path: '/about',
        note: 'redirect → who-we-are; about.nav.whoWeAre',
        fr: 'Qui nous sommes',
        en: 'Who we are',
      },
      {
        path: '/about/who-we-are',
        note: 'about.nav.whoWeAre',
        fr: 'Qui nous sommes',
        en: 'Who we are',
      },
      {
        path: '/about/team',
        note: 'about.nav.team',
        fr: 'Notre équipe',
        en: 'Our team',
      },
      {
        path: '/about/contact',
        note: 'about.nav.contact',
        fr: 'Nous contacter',
        en: 'Contact us',
      },
      {
        path: '/blog',
        note: 'blog.heroTitle',
        fr: 'Blog',
        en: 'Blog',
      },
      {
        path: '/donate',
        note: 'donate.title',
        fr: 'Soutenir nos actions',
        en: 'Support our work',
      },
      {
        path: '/support',
        note: 'support.pageTitle',
        fr: "Centre d'aide",
        en: 'Help centre',
      },
      {
        path: '/coming-soon',
        note: 'comingSoon.title',
        fr: 'Bientôt disponible',
        en: 'Coming soon',
      },
      {
        path: '/legal/terms',
        note: 'legal.termsOfUseTitle (empty CMS)',
        fr: "Conditions d'utilisation",
        en: 'Terms of use',
      },
      {
        path: '/legal/privacy',
        note: 'legal.privacyPolicyTitle (empty CMS)',
        fr: 'Politique de confidentialité',
        en: 'Privacy policy',
      },
    ];

    for (const route of marketing) {
      test(`${route.path} — ${route.note}`, async ({ page }) => {
        // Blog FR/EN share the same hero word « Blog » — also assert empty-state chrome.
        if (route.path === '/blog') {
          await page.goto('/blog', { waitUntil: 'domcontentloaded' });
          await forceLocale(page, 'fr');
          await expect(page.getByText('Aucun article publié')).toBeVisible({ timeout: 15_000 });
          await switchLanguage(page, 'en');
          await expect(page.getByText('No published articles')).toBeVisible({ timeout: 15_000 });
          await assertNoCommonFrHeaderChrome(page);
          return;
        }
        await smokeFrToEn(page, route);
      });
    }
  });
});
