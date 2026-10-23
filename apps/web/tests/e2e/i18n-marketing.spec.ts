import { expect, test, type Page } from './fixtures';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3002';

const COPY = {
  fr: {
    whoWeAre: 'Qui nous sommes',
    history: 'Notre histoire',
    team: 'Notre équipe',
    governance: 'Notre gouvernance',
    responsibility: 'Responsabilité',
    howWeWork: 'Comment nous travaillons',
    reports: 'Rapports et finances',
    media: 'Médias & ressources',
    contact: 'Nous contacter',
    contactPhone: 'Téléphone',
    contactEmail: 'E-mail',
    blog: 'Blog',
    blogNotFound: 'Article introuvable',
    donate: 'Soutenir nos actions',
    support: "Centre d'aide",
    comingSoon: 'Bientôt disponible',
    emptyPage: /Contenu en cours de préparation|Contenu bientôt disponible/i,
  },
  en: {
    whoWeAre: 'Who we are',
    history: 'Our history',
    team: 'Our team',
    governance: 'Our governance',
    responsibility: 'Responsibility',
    howWeWork: 'How we work',
    reports: 'Reports & finances',
    media: 'Media & resources',
    contact: 'Contact us',
    contactPhone: 'Phone',
    contactEmail: 'Email',
    blog: 'Blog',
    blogNotFound: 'Article not found',
    donate: 'Support our work',
    support: 'Help centre',
    comingSoon: 'Coming soon',
    emptyPage: /Content coming soon/i,
  },
  es: {
    whoWeAre: 'Quiénes somos',
    history: 'Nuestra historia',
    team: 'Nuestro equipo',
    governance: 'Nuestra gobernanza',
    responsibility: 'Responsabilidad',
    howWeWork: 'Cómo trabajamos',
    reports: 'Informes y finanzas',
    media: 'Medios y recursos',
    contact: 'Contáctenos',
    contactPhone: 'Teléfono',
    contactEmail: 'Correo electrónico',
    blog: 'Blog',
    blogNotFound: 'Artículo no encontrado',
    donate: 'Apoye nuestras acciones',
    support: 'Centro de ayuda',
    comingSoon: 'Próximamente',
    emptyPage: /Contenido en preparación|Contenido próximamente/i,
  },
} as const;

type Locale = keyof typeof COPY;

const ABOUT_ROUTES: { path: string; titleKey: keyof (typeof COPY)['en'] }[] = [
  { path: '/about/who-we-are', titleKey: 'whoWeAre' },
  { path: '/about/our-history', titleKey: 'history' },
  { path: '/about/team', titleKey: 'team' },
  { path: '/about/governance', titleKey: 'governance' },
  { path: '/about/responsibility', titleKey: 'responsibility' },
  { path: '/about/how-we-work', titleKey: 'howWeWork' },
  { path: '/about/reports', titleKey: 'reports' },
  { path: '/about/media-resources', titleKey: 'media' },
  { path: '/about/contact', titleKey: 'contact' },
];

async function setLocale(page: Page, locale: Locale) {
  await page.context().addCookies([{ name: 'atg-locale', value: locale, url: BASE_URL }]);
  await page.addInitScript((code: string) => {
    document.cookie = `atg-locale=${code};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
    try {
      localStorage.setItem('atg-locale', code);
    } catch {
      /* ignore */
    }
  }, locale);
}

async function mockEmptyCms(page: Page) {
  await page.route('**/api/public/about-pages/**', async (route) => {
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
  await page.route('**/api/public/about-resources**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [], meta: { total: 0, page: 1, limit: 50, totalPages: 0 } }),
    });
  });
  await page.route('**/api/public/blog**', async (route) => {
    const pathAfter = route.request().url().split('/api/public/blog')[1] ?? '';
    const isDetail = pathAfter.startsWith('/') && !pathAfter.startsWith('?');
    if (isDetail) {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Not found' }),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [], meta: { total: 0, page: 1, limit: 50, totalPages: 0 } }),
    });
  });
}

for (const locale of ['fr', 'en', 'es'] as const) {
  test.describe(`group F marketing i18n (${locale})`, () => {
    test.describe.configure({ timeout: 120_000 });

    test.beforeEach(async ({ page }) => {
      await setLocale(page, locale);
      await mockEmptyCms(page);
    });

    test(`16 routes shell — ${locale}`, async ({ page }) => {
      const c = COPY[locale];

      // /about → who-we-are
      await page.goto('/about', { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL(/\/about\/who-we-are/, { timeout: 15_000 });
      await expect(page.getByRole('heading', { name: c.whoWeAre, level: 1 })).toBeVisible();

      for (const route of ABOUT_ROUTES) {
        await page.goto(route.path, { waitUntil: 'domcontentloaded' });
        await expect(
          page.getByRole('heading', { name: c[route.titleKey] as string, level: 1 }),
        ).toBeVisible({ timeout: 15_000 });
      }

      // Contact labels when CMS contact fields are present
      const phoneLabel = page.getByText(c.contactPhone, { exact: true });
      const emailLabel = page.getByText(c.contactEmail, { exact: true });
      if ((await phoneLabel.count()) > 0) {
        await expect(phoneLabel.first()).toBeVisible();
      }
      if ((await emailLabel.count()) > 0) {
        await expect(emailLabel.first()).toBeVisible();
      }

      await page.goto('/blog', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { name: c.blog, level: 1 })).toBeVisible();

      await page.goto('/blog/e2e-missing-slug', { waitUntil: 'domcontentloaded' });
      await expect(page.getByText(c.blogNotFound)).toBeVisible({ timeout: 15_000 });

      await page.goto('/donate', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { name: c.donate, level: 1 })).toBeVisible();

      await page.goto('/support', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { name: c.support, level: 1 })).toBeVisible();
      await expect(
        page.getByLabel(/Rechercher dans l'aide|Search help|Buscar en la ayuda/i),
      ).toBeVisible();

      await page.goto('/coming-soon', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { name: c.comingSoon, level: 1 })).toBeVisible();

      // All search verticals implemented → redirect to live listing (document in inventaire)
      await page.goto('/coming-soon/flights', { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL(/\/flights/, { timeout: 15_000 });
    });
  });
}
