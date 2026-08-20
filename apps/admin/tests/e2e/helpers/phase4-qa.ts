import { expect, type Page } from '@playwright/test';

export { waitForPageIdle } from './phase3-qa';

/** Mois cible des seeds disponibilités chambres / classes vol. */
export const SEED_AVAILABILITY_YEAR_MONTH = '2026-08';

/** Site vitrine GAP (apps/gap) — aligné sur playwright.config.ts. */
export const gapURL = process.env.PLAYWRIGHT_GAP_URL ?? 'http://localhost:3004';

/** Admin — origine absolue pour revenir depuis la vitrine GAP. */
export const adminURL = (process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3001').replace(
  /\/$/,
  '',
);

// --- Catalog seed IDs (database/seeds/install.seed.sql) ---

export const SEED_DESTINATION_ID = '00000000-0000-4000-8000-000000002001';
export const SEED_PROPERTY_ID = '00000000-0000-4000-8000-000000002010';
export const SEED_ROOM_ID = '00000000-0000-4000-8000-000000002011';
export const SEED_ROOM_AVAIL_FULL_ID = '00000000-0000-4000-8000-000000002012';
export const SEED_ROOM_AVAIL_OPEN_ID = '00000000-0000-4000-8000-000000002013';

export const SEED_FLIGHT_ID = '00000000-0000-4000-8000-000000003020';
export const SEED_FLIGHT_CLASS_ID = '00000000-0000-4000-8000-000000003022';

export const SEED_SHIP_ID = '00000000-0000-4000-8000-000000003030';
export const SEED_ITINERARY_ID = '00000000-0000-4000-8000-000000003031';

export const SEED_ACTIVITY_ID = '00000000-0000-4000-8000-000000004031';

export const SEED_PACKAGE_ID = '00000000-0000-4000-8000-000000005001';

// --- GAP seed IDs (database/migrations/add_gap_content.sql) ---

export const SEED_GAP_SITE_SETTINGS_ID = '00000000-0000-4000-8000-00000000d001';
export const SEED_GAP_PAGE_ABOUT_ID = '00000000-0000-4000-8000-00000000d101';
export const SEED_GAP_PAGE_OBJECTIVES_ID = '00000000-0000-4000-8000-00000000d102';
export const SEED_GAP_PAGE_UNESCO_ID = '00000000-0000-4000-8000-00000000d103';
export const SEED_GAP_ACTIVITY_ID = '00000000-0000-4000-8000-00000000d201';
export const SEED_GAP_IMPACT_STAT_ID = '00000000-0000-4000-8000-00000000d301';
export const SEED_GAP_MEDIA_ITEM_ID = '00000000-0000-4000-8000-00000000d401';

// --- Seed availability dates (room + flight class grids) ---

export const SEED_ROOM_AVAIL_FULL_DATE = '2026-08-01';
export const SEED_ROOM_AVAIL_OPEN_DATE = '2026-08-08';
export const SEED_FLIGHT_CLASS_AVAIL_DATE = '2026-08-01';

// --- Seed display labels (FR content used for admin ↔ GAP coherence) ---

export const SEED_DESTINATION_NAME = 'Kinshasa';
export const SEED_DESTINATION_COUNTRY = 'CD';

export const SEED_GAP_SITE_TITLE = 'Gorilla Ambassadors Program';
export const SEED_GAP_PAGE_ABOUT_TITLE = 'Le programme';
export const SEED_GAP_ACTIVITY_TITLE = 'Sensibilisation des écoliers';
export const SEED_GAP_IMPACT_LABEL = 'Participants sensibilisés';
export const SEED_GAP_IMPACT_VALUE = '2 500+';
export const SEED_GAP_MEDIA_TITLE = 'Atelier de sensibilisation en école';

export const SEED_CRUISE_PORT_KIN_NAME = 'Kinshasa Port';
export const SEED_CRUISE_PORT_BNW_NAME = 'Banana Port';

export const SEED_AIRPORT_FIH = 'FIH';
export const SEED_AIRPORT_NBO = 'NBO';

export const SEED_ACTIVITY_IMAGE_CAPTION = 'Quartier Gombe, Kinshasa';

// --- i18n selectors (FR / EN / ES) ---

export const AVAILABILITY_PREVIOUS_MONTH =
  /Mois précédent|Previous month|Mes anterior/i;

export const AVAILABILITY_NEXT_MONTH = /Mois suivant|Next month|Mes siguiente/i;

export const FLIGHT_TIMELINE_ARIA = /Trajet du vol|Flight route|Ruta del vuelo/i;

export const CRUISE_PORTS_TIMELINE_ARIA =
  /Schéma des escales|Port itinerary|Itinerario de escalas/i;

export const IMAGES_GALLERY_ARIA =
  /Galerie photos|Photo gallery|Galería de fotos/i;

export const PACKAGE_COMPOSITION_ARIA = /Composition du forfait/i;

export const DESTINATION_HERO_ARIA = (name: string) =>
  new RegExp(`Destination ${name}|Destino ${name}`, 'i');

export const ACTIVITY_PHOTOS_HEADING = /^Photos$|^Galerie photos$/i;

export const ACTIVITY_ADD_PHOTO =
  /Ajouter une photo|Add photo|Añadir una foto/i;

// --- Admin route builders ---

export function roomAvailabilityPath(propertyId = SEED_PROPERTY_ID, roomId = SEED_ROOM_ID) {
  return `/hebergements/${propertyId}/chambres/${roomId}/disponibilites`;
}

export function flightClassAvailabilityPath(
  flightId = SEED_FLIGHT_ID,
  classId = SEED_FLIGHT_CLASS_ID,
) {
  return `/produits/vols/${flightId}/classes/${classId}/disponibilites`;
}

export function flightViewPath(flightId = SEED_FLIGHT_ID) {
  return `/produits/vols/${flightId}/voir`;
}

export function itineraryPortsPath(
  shipId = SEED_SHIP_ID,
  itineraryId = SEED_ITINERARY_ID,
) {
  return `/produits/croisieres/navires/${shipId}/itineraires/${itineraryId}`;
}

export function activityEditPath(activityId = SEED_ACTIVITY_ID) {
  return `/produits/activites/${activityId}`;
}

export function packageViewPath(packageId = SEED_PACKAGE_ID) {
  return `/produits/forfaits/${packageId}/voir`;
}

export function destinationViewPath(destinationId = SEED_DESTINATION_ID) {
  return `/produits/destinations/${destinationId}/voir`;
}

// --- GAP site URLs (absolute) ---

export function gapHomeUrl() {
  return `${gapURL}/`;
}

export function gapAboutUrl() {
  return `${gapURL}/about`;
}

export function gapActivitiesUrl() {
  return `${gapURL}/activities`;
}

export function gapImpactUrl() {
  return `${gapURL}/impact`;
}

/** Navigate to the GAP vitrine (separate origin from admin). */
export async function gotoGap(page: Page, path: '/' | '/about' | '/activities' | '/impact' = '/') {
  const url =
    path === '/'
      ? gapHomeUrl()
      : path === '/about'
        ? gapAboutUrl()
        : path === '/activities'
          ? gapActivitiesUrl()
          : gapImpactUrl();
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await waitForGapPageReady(page);
}

const GAP_LOADING_TEXT = /^Chargement…$|^Loading…$|^Cargando…$/i;

/** Attend la fin du fetch client-side sur les pages GAP. */
export async function waitForGapPageReady(page: Page) {
  await expect(page.getByText(GAP_LOADING_TEXT)).toHaveCount(0, { timeout: 60_000 });
}

/** Retourne sur l'admin après navigation cross-origin (GAP). */
export async function gotoAdmin(page: Page, path = '/dashboard') {
  await page.goto(`${adminURL}${path}`, { waitUntil: 'domcontentloaded' });
}

const MONTH_HEADING_CHECKS: Array<{ month: number; pattern: RegExp }> = [
  { month: 12, pattern: /d[eé]cembre|december|diciembre/i },
  { month: 11, pattern: /novembre|november|noviembre/i },
  { month: 10, pattern: /octobre|october|octubre/i },
  { month: 9, pattern: /septembre|september|septiembre/i },
  { month: 8, pattern: /ao[uû]t|august|agosto/i },
  { month: 7, pattern: /juillet|july|julio/i },
  { month: 6, pattern: /juin|june|junio/i },
  { month: 5, pattern: /\bmai\b|\bmay\b|\bmayo\b/i },
  { month: 4, pattern: /avril|april/i },
  { month: 3, pattern: /mars|march|marzo/i },
  { month: 2, pattern: /f[eé]vrier|february|febrero/i },
  { month: 1, pattern: /janvier|january|enero/i },
];

function parseAvailabilityMonthHeading(text: string): { year: number; month: number } | null {
  const yearMatch = text.match(/(\d{4})/);
  if (!yearMatch) return null;

  const year = Number(yearMatch[1]);
  for (const { month, pattern } of MONTH_HEADING_CHECKS) {
    if (pattern.test(text)) {
      return { year, month };
    }
  }
  return null;
}

/** Affiche le mois YYYY-MM dans une grille H4/V3 (navigation ‹ ›). */
export async function ensureAvailabilityMonth(
  page: Page,
  targetYearMonth = SEED_AVAILABILITY_YEAR_MONTH,
) {
  const [targetYear, targetMonth] = targetYearMonth.split('-').map(Number);
  const heading = page.locator('h3[aria-live="polite"]').first();

  for (let attempt = 0; attempt < 36; attempt += 1) {
    await expect(heading).toBeVisible({ timeout: 15_000 });
    const parsed = parseAvailabilityMonthHeading((await heading.textContent()) ?? '');
    if (parsed?.year === targetYear && parsed.month === targetMonth) {
      return;
    }

    const goForward =
      !parsed ||
      parsed.year < targetYear ||
      (parsed.year === targetYear && parsed.month < targetMonth);

    const button = page.getByRole('button', {
      name: goForward ? AVAILABILITY_NEXT_MONTH : AVAILABILITY_PREVIOUS_MONTH,
    });
    await button.click();
    await expect(page.locator('[aria-busy="true"]')).toHaveCount(0, { timeout: 30_000 });
  }

  throw new Error(`Impossible d'afficher le mois ${targetYearMonth} dans la grille disponibilités.`);
}
