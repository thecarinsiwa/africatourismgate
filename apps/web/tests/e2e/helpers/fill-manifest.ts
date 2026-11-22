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

/** Fill traveler nationality SearchableSelect (label Nationalité - not emergency "Pays"). */
async function selectTravelerNationality(page: Page, index: number, countryQuery: string) {
  const nat = page
    .getByRole('button', {
      name: /nationalit|nationality|nacionalidad/i,
    })
    .nth(index);
  await nat.click();
  const search = page.locator('input[type="search"]').last();
  await search.fill(countryQuery);
  await page.getByRole('option').filter({ hasText: /\(CD\)/i }).first().click();
}

const EMERGENCY_ACCORDION_NAME =
  /contact d['’]urgence|emergency contact|contacto de emergencia/i;
const EMERGENCY_NAME_LABEL =
  /nom du contact|contact name|nombre del contacto/i;
const TRAVELER_TOGGLE_NAME = /^(voyageur|traveler|viajero)\s+\d+$/i;

export async function ensureEmergencyContactExpanded(page: Page): Promise<void> {
  const nameField = page.getByLabel(EMERGENCY_NAME_LABEL).first();
  if (await nameField.isVisible().catch(() => false)) {
    return;
  }

  // Prefer the collapsed chevron (aria-expanded=false + exact section title).
  const collapsedChevron = page
    .getByRole('button', { name: EMERGENCY_ACCORDION_NAME, expanded: false })
    .last();
  if ((await collapsedChevron.count()) > 0) {
    await collapsedChevron.click();
  } else {
    await page.getByRole('button', { name: EMERGENCY_ACCORDION_NAME }).first().click();
  }

  await nameField.waitFor({ state: 'visible', timeout: 15_000 });
}

/** Fill booking-level emergency contact + required traveler fields on checkout recap. */
export async function fillCheckoutManifest(page: Page): Promise<number> {
  // Labels include a required "*" - never use ^…$ anchors on getByLabel.
  // Emergency / traveler sections are collapsed accordions on recap by default.
  await ensureEmergencyContactExpanded(page);
  await page.getByLabel(EMERGENCY_NAME_LABEL).first().fill('Contact Urgence');
  // Emergency phone is the only input[type=tel] on the recap (travelers have no tel field).
  await page.locator('input[type="tel"]').first().fill('+243900000001');

  // Chevron buttons use aria-label "Voyageur N" / "Traveler N" / "Viajero N".
  const travelerToggles = page.getByRole('button', { name: TRAVELER_TOGGLE_NAME });
  await travelerToggles.first().waitFor({ state: 'visible', timeout: 15_000 });
  const count = await travelerToggles.count();

  for (let i = 0; i < count; i += 1) {
    const toggle = travelerToggles.nth(i);
    const expanded = await toggle.getAttribute('aria-expanded');
    if (expanded !== 'true') {
      await toggle.click();
    }
    // Use textbox role — getByLabel also matches the traveler fieldset whose
    // accessible name includes the collapsed "N° pièce d'identité: …" summary.
    const nameInput = page.getByRole('textbox', {
      name: /nom complet|full name|nombre completo/i,
    });
    await nameInput.waitFor({ state: 'visible', timeout: 10_000 });
    await nameInput.fill(`Voyageur ${i + 1}`);
    // Only the expanded traveler nationality is in the DOM (Pays ≠ Nationalité).
    await selectTravelerNationality(page, 0, 'Congo');
    await page
      .getByRole('textbox', {
        name: /n[°º]\s*pi[eè]ce|id\s*\/\s*passport|n\.?\s*º?\s*de documento|passport number/i,
      })
      .fill(`P${100000 + i}`);
  }

  return count;
}
