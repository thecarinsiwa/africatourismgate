import type { Page, Route } from '@playwright/test';

/** Mock POST /bookings/:id/manifest-entries (and identity uploads if any). */
export async function mockManifestApi(page: Page): Promise<void> {
  await page.route('**/api/bookings/*/manifest-entries', async (route: Route) => {
    if (route.request().method() !== 'POST') {
      await route.fallback();
      return;
    }
    const body = route.request().postDataJSON() as {
      fullName?: string;
      nationality?: string;
      idNumber?: string;
      sortOrder?: number;
    };
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        id: `manifest-e2e-${body.sortOrder ?? 0}`,
        bookingId: 'booking-e2e',
        sortOrder: body.sortOrder ?? 0,
        fullName: body.fullName ?? '',
        nationality: body.nationality ?? null,
        idNumber: body.idNumber ?? null,
        createdAt: new Date().toISOString(),
        updatedAt: null,
      }),
    });
  });

  await page.route('**/api/bookings/*/emergency-contact', async (route: Route) => {
    const method = route.request().method();
    if (method !== 'PATCH' && method !== 'GET') {
      await route.fallback();
      return;
    }
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(null),
      });
      return;
    }
    const body = route.request().postDataJSON() as {
      name?: string;
      phone?: string;
      email?: string | null;
      country?: string | null;
      address?: string | null;
    };
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        name: body.name ?? null,
        phone: body.phone ?? null,
        email: body.email ?? null,
        country: body.country ?? null,
        address: body.address ?? null,
      }),
    });
  });
}

async function selectNationality(page: Page, index: number, countryQuery: string) {
  // Label text includes a required "*", so avoid exact ^…$ getByLabel matches.
  const nat = page
    .getByRole('button', {
      name: /choisir un pays|choose a country|elegir un pa[ií]s|nationalit|nationality|nacionalidad/i,
    })
    .nth(index);
  await nat.click();
  const search = page.locator('input[type="search"]').last();
  await search.fill(countryQuery);
  await page.getByRole('option').filter({ hasText: /\(CD\)/i }).first().click();
}

/** Fill booking-level emergency contact + required traveler fields on checkout recap. */
export async function fillCheckoutManifest(page: Page): Promise<number> {
  const emName = page.getByLabel(/nom du contact|contact name|nombre del contacto/i).first();
  await emName.fill('Contact Urgence');
  const emPhone = page.getByLabel(/^t[ée]l[ée]phone$|^phone$|^tel[ée]fono$/i).first();
  await emPhone.fill('+243900000001');

  const nameInputs = page.getByLabel(/nom complet|full name|nombre completo/i);
  const count = await nameInputs.count();
  for (let i = 0; i < count; i += 1) {
    await nameInputs.nth(i).fill(`Voyageur ${i + 1}`);
  }

  // Traveler nationality selects come after the emergency-contact country select.
  for (let i = 0; i < count; i += 1) {
    await selectNationality(page, i + 1, 'Congo');
  }

  const idInputs = page.getByLabel(
    /n[°º]\s*pi[eè]ce|id\s*\/\s*passport|n\.?\s*º?\s*de documento|passport number/i,
  );
  const idCount = await idInputs.count();
  for (let i = 0; i < idCount; i += 1) {
    await idInputs.nth(i).fill(`P${100000 + i}`);
  }

  return count;
}
