import { expect, test, type Page } from '@playwright/test';

/** Mock public CMS so marketing pages show graceful empty states (no live API). */
async function mockEmptyMarketingCms(page: Page) {
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
      body: JSON.stringify({ data: [], meta: { total: 0, page: 1, limit: 50 } }),
    });
  });

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
      body: JSON.stringify({ data: [], meta: { total: 0, page: 1, limit: 50 } }),
    });
  });
}

async function assertShell(page: Page) {
  await expect(
    page.getByRole('navigation', { name: /Navigation principale|Main navigation|Navegación principal/i }),
  ).toBeVisible();
  await expect(page.locator('footer')).toBeVisible();
}

test.describe('Marketing pages smoke', () => {
  test.describe.configure({ timeout: 90_000 });

  test('blog, donate, about, support load with graceful empty states', async ({ page }) => {
    await mockEmptyMarketingCms(page);

    // 1. Blog list
    await page.goto('/blog');
    await assertShell(page);
    await expect(page.getByRole('heading', { name: 'Blog', level: 1 })).toBeVisible();
    await expect(page.getByText(/Aucun article publi[ée]|No published articles|No hay artículos/i)).toBeVisible({
      timeout: 15_000,
    });

    // 2. Blog missing slug
    await page.goto('/blog/e2e-missing-slug');
    await assertShell(page);
    await expect(page.getByText(/Aucun article publi[ée]|No published articles|No hay artículos/i)).toBeVisible({
      timeout: 15_000,
    });
    await expect(
      page.getByRole('link', { name: /Retour au blog|Back to blog|Volver al blog/i }),
    ).toBeVisible();

    // 3. Donate (SSR — page.route cannot force empty; tolerate empty or campaigns)
    await page.goto('/donate');
    await assertShell(page);
    await expect(
      page.getByRole('heading', {
        name: /Soutenir nos actions|Support our work|Apoyar nuestras acciones/i,
        level: 1,
      }),
    ).toBeVisible();
    await expect(
      page
        .getByText(/Aucune campagne de don|No donation campaigns|Ninguna campaña de donación/i)
        .or(page.getByRole('heading', { name: /Toutes les campagnes|All campaigns|Todas las campañas/i })),
    ).toBeVisible({ timeout: 15_000 });

    // 4. About text page (CMS 404 → emptyPage)
    await page.goto('/about/who-we-are');
    await assertShell(page);
    await expect(
      page.getByRole('heading', { name: /Qui nous sommes|Who we are|Quiénes somos/i, level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByText(/Contenu en cours de préparation|Content being prepared|Contenido en preparación/i),
    ).toBeVisible({ timeout: 15_000 });

    // 5. About team list empty
    await page.goto('/about/team');
    await assertShell(page);
    await expect(
      page.getByRole('heading', { name: /Notre équipe|Our team|Nuestro equipo/i, level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByText(/Aucun membre de l'équipe|No team members|Ningún miembro del equipo/i),
    ).toBeVisible({ timeout: 15_000 });

    // 6. Help centre smoke (deep ticket / search flows stay in support.spec.ts)
    await page.goto('/support');
    await assertShell(page);
    await expect(
      page.getByRole('heading', {
        name: /Centre d'aide|Help centre|Centro de ayuda/i,
        level: 1,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        name: /Parcourir par thème|Browse by topic|Explorar por tema/i,
      }),
    ).toBeVisible();
    await expect(
      page.getByLabel(/Rechercher dans l'aide|Search help|Buscar en la ayuda/i),
    ).toBeVisible();

    await page
      .getByRole('link', { name: /Réservations|Bookings|Reservas/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/support\/booking\/?$/);
    await expect(
      page.getByRole('heading', {
        name: /Réservations|Bookings|Reservas/i,
        level: 1,
      }),
    ).toBeVisible();

    await page
      .getByRole('link', {
        name: /modifier ou annuler|change or cancel|cambio o cancelo/i,
      })
      .first()
      .click();
    await expect(page).toHaveURL(/\/support\/booking\/modify-or-cancel\/?$/);
    await expect(
      page.getByRole('heading', {
        name: /modifier ou annuler|change or cancel|cambio o cancelo/i,
        level: 1,
      }),
    ).toBeVisible();
  });
});
