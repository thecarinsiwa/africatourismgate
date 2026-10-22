import { expect, test, type Page } from './fixtures';

const MEMBER = {
  id: 'e2e-member-1',
  name: 'Carin Siwa',
  slug: 'carin-siwa',
  role: 'CEO',
  bio: 'Carin founded Africa Tourism Gate after fifteen years in sustainable tourism across Central Africa, building a network of local partners, guides and responsible lodges.',
  photoUrl: null,
  email: 'carin@example.com',
  linkedinUrl: 'https://www.linkedin.com/in/carin-siwa',
  xUrl: null,
  facebookUrl: null,
  instagramUrl: null,
  sortOrder: 1,
  locale: 'fr',
};

/** Client-side fetches only; server metadata falls back to the slug when the API is absent. */
async function mockTeamApi(page: Page) {
  await page.route('**/api/public/team-members**', async (route) => {
    const pathAfter = route.request().url().split('/api/public/team-members')[1] ?? '';
    const detailSlug = pathAfter.startsWith('/') ? pathAfter.slice(1).split('?')[0] : null;
    if (detailSlug) {
      const found = detailSlug === MEMBER.slug;
      await route.fulfill({
        status: found ? 200 : 404,
        contentType: 'application/json',
        body: JSON.stringify(found ? MEMBER : { message: 'Not found' }),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [MEMBER], meta: { total: 1, page: 1, limit: 50, totalPages: 1 } }),
    });
  });
}

test.describe('About — team grid and profile', () => {
  test.describe.configure({ timeout: 90_000 });

  test('card links to the profile page with breadcrumb, contacts and back link', async ({ page }) => {
    await mockTeamApi(page);

    await page.goto('/about/team');
    const card = page.locator('main article').filter({ hasText: MEMBER.name });
    await expect(card).toBeVisible({ timeout: 15_000 });

    await card.getByRole('link', { name: /Voir le profil|View Profile|Ver perfil/i }).click();
    await expect(page).toHaveURL(/\/about\/team\/carin-siwa$/);

    await expect(page.getByRole('heading', { level: 1, name: MEMBER.name })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole('heading', { level: 2, name: MEMBER.role })).toBeVisible();

    const breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' });
    await expect(breadcrumb.getByRole('link', { name: /Notre équipe|Our Team|Nuestro equipo/i })).toBeVisible();
    await expect(breadcrumb.getByText(MEMBER.name)).toBeVisible();

    await expect(page.locator(`main a[href="mailto:${MEMBER.email}"]`)).toBeVisible();
    await expect(page.locator(`main a[href="${MEMBER.linkedinUrl}"]`)).toHaveAttribute('target', '_blank');

    await page.getByRole('link', { name: /Retour à l'équipe|Back to Team|Volver al equipo/i }).click();
    await expect(page).toHaveURL(/\/about\/team$/);
  });

  test('unknown slug shows the not-found state', async ({ page }) => {
    await mockTeamApi(page);

    await page.goto('/about/team/e2e-unknown-member');
    await expect(
      page.getByRole('heading', { level: 1, name: /Profil introuvable|Profile not found|Perfil no encontrado/i }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('link', { name: /Retour à l'équipe|Back to Team|Volver al equipo/i })).toBeVisible();
  });
});
