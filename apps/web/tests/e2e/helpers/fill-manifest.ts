import type { Page, Route } from '@playwright/test';

/** Mock POST /bookings/:id/manifest-entries (and identity uploads if any). */
export async function mockManifestApi(page: Page): Promise<void> {
  await page.route('**/api/bookings/*/manifest-entries', async (route: Route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }
    const body = route.request().postDataJSON() as {
      fullName?: string;
      nationality?: string;
      idNumber?: string;
      sortOrder?: number;
      emergencyContactName?: string;
      emergencyContactPhone?: string;
      emergencyContactEmail?: string;
      emergencyContactCountry?: string;
      emergencyContactAddress?: string;
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
        emergencyContactName: body.emergencyContactName ?? null,
        emergencyContactPhone: body.emergencyContactPhone ?? null,
        emergencyContactEmail: body.emergencyContactEmail ?? null,
        emergencyContactCountry: body.emergencyContactCountry ?? null,
        emergencyContactAddress: body.emergencyContactAddress ?? null,
        createdAt: new Date().toISOString(),
        updatedAt: null,
      }),
    });
  });
}

async function selectNationality(page: Page, index: number, countryQuery: string) {
  const nat = page.getByLabel(/^nationalit[eé]$|^nationality$|^nacionalidad$/i).nth(index);
  await nat.click();
  const search = page.locator('input[type="search"]').last();
  await search.fill(countryQuery);
  await page.getByRole('option').filter({ hasText: /\(CD\)/i }).first().click();
}

/** Fill required checkout manifest fields for every traveler shown on recap. */
export async function fillCheckoutManifest(page: Page): Promise<number> {
  const nameInputs = page.getByLabel(/nom complet|full name|nombre completo/i);
  const count = await nameInputs.count();
  for (let i = 0; i < count; i += 1) {
    await nameInputs.nth(i).fill(`Voyageur ${i + 1}`);
  }

  for (let i = 0; i < count; i += 1) {
    await selectNationality(page, i, 'Congo');
  }

  const idInputs = page.getByLabel(
    /n[°º]\s*pi[eè]ce|id\s*\/\s*passport|n\.?\s*º?\s*de documento|passport number/i,
  );
  const idCount = await idInputs.count();
  for (let i = 0; i < idCount; i += 1) {
    await idInputs.nth(i).fill(`P${100000 + i}`);
  }

  const emNameInputs = page.getByLabel(/nom du contact|contact name|nombre del contacto/i);
  const emNameCount = await emNameInputs.count();
  for (let i = 0; i < emNameCount; i += 1) {
    await emNameInputs.nth(i).fill(`Contact Urgence ${i + 1}`);
  }

  const emPhoneInputs = page.getByLabel(/^t[ée]l[ée]phone$|^phone$|^tel[ée]fono$/i);
  const emPhoneCount = await emPhoneInputs.count();
  for (let i = 0; i < emPhoneCount; i += 1) {
    await emPhoneInputs.nth(i).fill(`+24390000000${i}`);
  }

  return count;
}
