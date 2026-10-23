import { expect, test, type Page } from './fixtures';

type ListingCase = {
  name: string;
  path: string;
  errorText: RegExp;
};

/**
 * Client listings call `fetchPublic` → `NEXT_PUBLIC_API_URL` + `/public/...`.
 * Fixtures already fulfill non-upload `/api/**` with 503 → catch → ListingErrorState.
 */
const LISTING_CASES: ListingCase[] = [
  {
    name: 'hotels',
    path: '/hotels',
    errorText: /Impossible de charger les résultats/i,
  },
  {
    name: 'flights',
    path: '/flights',
    errorText: /Impossible de charger les vols/i,
  },
  {
    name: 'cars',
    path: '/cars',
    errorText: /Impossible de charger les véhicules/i,
  },
  {
    name: 'cruises',
    path: '/cruises',
    errorText: /Impossible de charger les croisières/i,
  },
  {
    name: 'activities',
    path: '/activities',
    errorText: /Impossible de charger les activités/i,
  },
  {
    name: 'packages',
    path: '/packages',
    errorText: /Impossible de charger les forfaits/i,
  },
];

function listingRetryButton(page: Page) {
  return page.getByRole('button', {
    name: /^Réessayer$|^Retry$|^Reintentar$|^Try again$/i,
  });
}

function listingHomeLink(page: Page) {
  return page.getByRole('link', {
    name: /Retour à l'accueil|Back to home|Volver al inicio/i,
  });
}

test.describe('Listing API error states (WEB-011)', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ page }) => {
    const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3002';
    await page.context().addCookies([{ name: 'atg-locale', value: 'fr', url: baseURL }]);
  });

  for (const listing of LISTING_CASES) {
    test(`${listing.name} listing shows load error + retry + home when API returns 503`, async ({
      page,
    }) => {
      await page.goto(listing.path, { waitUntil: 'domcontentloaded' });

      await expect(page.getByText(listing.errorText).first()).toBeVisible({
        timeout: 25_000,
      });
      await expect(listingRetryButton(page)).toBeVisible();
      await expect(listingHomeLink(page).first()).toBeVisible();
    });
  }
});
