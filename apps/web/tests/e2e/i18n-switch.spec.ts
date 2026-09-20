import { expect, test, type Page } from '@playwright/test';

/** Force empty legal CMS so UI copy comes from next-intl messages. */
async function mockEmptyLegalPages(page: Page) {
  await page.route('**/api/public/legal-pages/**', async (route) => {
    await route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Not found' }),
    });
  });
}

function localeCodeFromLabel(language: RegExp): 'en' | 'es' | 'fr' {
  const source = language.source.toLowerCase();
  if (source.includes('english')) return 'en';
  if (source.includes('espa')) return 'es';
  return 'fr';
}

async function switchLanguage(page: Page, language: RegExp) {
  const code = localeCodeFromLabel(language);
  await page
    .getByRole('button', { name: /Choisir la langue|Select language|Elegir idioma/i })
    .first()
    .click();
  await page.getByRole('menuitemradio', { name: language }).click();
  await page.evaluate((locale) => {
    document.cookie = `atg-locale=${locale};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
    try {
      localStorage.setItem('atg-locale', locale);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = locale;
  }, code);
  await page.goto(page.url(), { waitUntil: 'domcontentloaded' });
  await expect(
    page.getByRole('button', { name: /Choisir la langue|Select language|Elegir idioma/i }).first(),
  ).toContainText(code.toUpperCase(), { timeout: 15_000 });
}

test.describe('Language switch (FR/EN/ES)', () => {
  test.describe.configure({ timeout: 60_000 });
  test('booking login shows English labels after switch', async ({ page }) => {
    await page.goto('/booking/login');

    await expect(page.getByRole('heading', { name: 'Connexion client' })).toBeVisible();

    await switchLanguage(page, /English/i);

    await expect(page.getByRole('heading', { name: 'Customer sign in' })).toBeVisible();
    await expect(page.getByLabel('Email address')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  });

  test('home navigation shows English after switch', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('link', { name: 'Connexion', exact: true })).toBeVisible();

    await switchLanguage(page, /English/i);

    await expect(page.getByRole('link', { name: 'Sign in', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Home', exact: true })).toBeVisible();
  });

  test('booking login shows Spanish labels after switch', async ({ page }) => {
    await page.goto('/booking/login');

    await expect(page.getByRole('heading', { name: 'Connexion client' })).toBeVisible();

    await switchLanguage(page, /Español/i);

    await expect(page.getByRole('heading', { name: 'Inicio de sesión del cliente' })).toBeVisible();
    await expect(page.getByLabel('Correo electrónico')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toBeVisible();
  });

  test('home navigation shows Spanish after switch', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('link', { name: 'Connexion', exact: true })).toBeVisible();

    await switchLanguage(page, /Español/i);

    await expect(page.getByRole('link', { name: 'Iniciar sesión', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Inicio', exact: true })).toBeVisible();
  });

  test('legal terms shows English labels after switch', async ({ page }) => {
    await mockEmptyLegalPages(page);
    await page.goto('/legal/terms');

    await expect(page.getByRole('heading', { name: "Conditions d'utilisation" })).toBeVisible();
    await expect(page.getByText('Contenu en cours de préparation')).toBeVisible();

    await switchLanguage(page, /English/i);

    await expect(page.getByRole('heading', { name: 'Terms of use' })).toBeVisible();
    await expect(page.getByText('Content coming soon')).toBeVisible();
    await expect(
      page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: 'Home' }),
    ).toBeVisible();
  });

  test('legal privacy shows Spanish labels after switch', async ({ page }) => {
    await mockEmptyLegalPages(page);
    await page.goto('/legal/privacy');

    await expect(page.getByRole('heading', { name: 'Politique de confidentialité' })).toBeVisible();
    await expect(page.getByText('Contenu en cours de préparation')).toBeVisible();

    await switchLanguage(page, /Español/i);

    await expect(page.getByRole('heading', { name: 'Política de privacidad' })).toBeVisible();
    await expect(page.getByText('Contenido en preparación')).toBeVisible();
    await expect(
      page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: 'Inicio' }),
    ).toBeVisible();
  });

  test('support page shows English labels after switch', async ({ page }) => {
    await page.goto('/support');

    await expect(page.getByRole('heading', { name: "Centre d'aide", level: 1 })).toBeVisible();

    await switchLanguage(page, /English/i);

    await expect(page.getByRole('heading', { name: 'Help centre', level: 1 })).toBeVisible();
  });

  test('about page shows Spanish labels after switch', async ({ page }) => {
    await page.route('**/api/public/about-pages/**', async (route) => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Not found' }),
      });
    });

    await page.goto('/about/who-we-are');

    await expect(page.getByRole('heading', { name: 'Qui nous sommes', level: 1 })).toBeVisible();
    await expect(
      page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: 'À propos' }),
    ).toBeVisible();

    await switchLanguage(page, /Español/i);

    await expect(page.getByRole('heading', { name: 'Quiénes somos', level: 1 })).toBeVisible();
    await expect(
      page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: 'Sobre nosotros' }),
    ).toBeVisible();
  });

  test('blog empty state shows English after switch', async ({ page }) => {
    await page.route('**/api/public/blog**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [], meta: { total: 0, page: 1, limit: 50 } }),
      });
    });

    await page.goto('/blog');

    await expect(page.getByText('Aucun article publié')).toBeVisible({ timeout: 15_000 });

    await switchLanguage(page, /English/i);

    await expect(page.getByText('No published articles')).toBeVisible({ timeout: 15_000 });
  });

  test('coming-soon page shows English after switch', async ({ page }) => {
    await page.goto('/coming-soon');

    await expect(page.getByRole('heading', { name: 'Bientôt disponible' })).toBeVisible();

    await switchLanguage(page, /English/i);

    await expect(page.getByRole('heading', { name: 'Coming soon' })).toBeVisible();
  });

  test('home search tabs and why-us show English after switch', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('tab', { name: 'Hôtels' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Pourquoi nous choisir' })).toBeVisible();

    await switchLanguage(page, /English/i);

    await expect(page.getByRole('tab', { name: 'Hotels' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Why choose us' })).toBeVisible();
  });

  test('home footer shows English after switch', async ({ page }) => {
    await page.goto('/');

    await expect(
      page.getByText(/passerelle vers les meilleures expériences/i),
    ).toBeVisible();

    await switchLanguage(page, /English/i);

    await expect(
      page.getByText(/gateway to the best travel experiences/i),
    ).toBeVisible();
    await expect(page.getByText('Carin Siwa and Ruth Bwiza')).toBeVisible();
  });

  test('hotels listing shows English after switch', async ({ page }) => {
    await page.route('**/api/public/accommodations**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [], meta: { total: 0, page: 1, limit: 20 } }),
      });
    });

    await page.goto('/hotels');

    await expect(
      page.getByRole('heading', { name: "Hébergements d'exception en Afrique" }),
    ).toBeVisible();

    await switchLanguage(page, /English/i);

    await expect(
      page.getByRole('heading', { name: 'Exceptional stays across Africa' }),
    ).toBeVisible();
  });

  test('packages listing shows English after switch', async ({ page }) => {
    await page.route('**/api/public/packages**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [], meta: { total: 0, page: 1, limit: 20 } }),
      });
    });

    await page.goto('/packages');

    await expect(
      page.getByRole('heading', { name: 'Forfaits combinés en Afrique' }),
    ).toBeVisible();

    await switchLanguage(page, /English/i);

    await expect(
      page.getByRole('heading', { name: 'Combined packages in Africa' }),
    ).toBeVisible();
  });

  test('booking cancel shows English after switch', async ({ page }) => {
    await page.goto('/booking/cancel');

    await expect(page.getByRole('heading', { name: 'Paiement annulé' })).toBeVisible();

    await switchLanguage(page, /English/i);

    await expect(page.getByRole('heading', { name: 'Payment cancelled' })).toBeVisible();
  });

  test('account shell shows English after switch', async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem(
        'atg.web.session',
        JSON.stringify({
          accessToken: 'e2e-i18n-account-token',
          refreshToken: 'e2e-i18n-account-refresh',
          expiresAt: Date.now() + 60 * 60 * 1000,
          user: {
            id: 'user-e2e-i18n',
            email: 'i18n@example.com',
            firstName: 'I18n',
            lastName: 'Test',
            organizationId: null,
            status: 'active',
          },
        }),
      );
    });

    await page.route('**/api/auth/me', async (route) => {
      if (route.request().method() === 'PATCH') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'user-e2e-i18n',
            email: 'i18n@example.com',
            firstName: 'I18n',
            lastName: 'Test',
            phone: null,
            preferredLanguage: 'en',
            organizationId: null,
            status: 'active',
            avatarUrl: null,
          }),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 'user-e2e-i18n',
            email: 'i18n@example.com',
            firstName: 'I18n',
            lastName: 'Test',
            phone: null,
            preferredLanguage: 'fr',
            organizationId: null,
            status: 'active',
            avatarUrl: null,
          },
          permissions: [],
          isSuperAdmin: false,
        }),
      });
    });

    await page.goto('/account/profile');

    await expect(page.getByRole('heading', { name: 'Mon compte' })).toBeVisible();

    await switchLanguage(page, /English/i);

    await expect(page.getByRole('heading', { name: 'My account' })).toBeVisible();
  });
});
