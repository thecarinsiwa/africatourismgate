import { expect, test } from '@playwright/test';
import { loginAsSeedAdmin } from './helpers/admin-auth';
import {
  ACTIVITY_ADD_PHOTO,
  ACTIVITY_PHOTOS_HEADING,
  AVAILABILITY_NEXT_MONTH,
  AVAILABILITY_PREVIOUS_MONTH,
  CRUISE_PORTS_TIMELINE_ARIA,
  DESTINATION_HERO_ARIA,
  FLIGHT_TIMELINE_ARIA,
  IMAGES_GALLERY_ARIA,
  PACKAGE_COMPOSITION_ARIA,
  SEED_AIRPORT_FIH,
  SEED_AIRPORT_NBO,
  SEED_CRUISE_PORT_BNW_NAME,
  SEED_CRUISE_PORT_KIN_NAME,
  SEED_DESTINATION_NAME,
  SEED_GAP_ACTIVITY_TITLE,
  SEED_GAP_IMPACT_LABEL,
  SEED_GAP_IMPACT_VALUE,
  SEED_GAP_MEDIA_TITLE,
  SEED_GAP_PAGE_ABOUT_TITLE,
  SEED_GAP_SITE_TITLE,
  activityEditPath,
  destinationViewPath,
  ensureAvailabilityMonth,
  flightClassAvailabilityPath,
  flightViewPath,
  gotoGap,
  gotoAdmin,
  itineraryPortsPath,
  packageViewPath,
  roomAvailabilityPath,
  waitForPageIdle,
} from './helpers/phase4-qa';

const ACCOMMODATIONS_HEADING = /^Hébergements$|^Accommodations$|^Alojamientos$/i;
const AMENITIES_DESCRIPTION =
  /Catalogue global réutilisable|Global reusable catalog|Catálogo global reutilizable/i;
const AMENITIES_TABLE_VIEW = /^Tableau$|^Table$|^Tabla$/i;
const FLIGHTS_HEADING = /^Vols$|^Flights$|^Vuelos$/i;
const AIRLINES_HEADING = /^Compagnies aériennes$|^Airlines$|^Aerolíneas$/i;
const AIRPORTS_HEADING = /^Aéroports$|^Airports$|^Aeropuertos$/i;
const VEHICLES_HEADING = /^Locations véhicules$|^Vehicle rentals$|^Alquiler de vehículos$/i;
const AGENCIES_HEADING = /^Agences de location$|^Rental agencies$|^Agencias de alquiler$/i;
const CATEGORIES_HEADING =
  /^Catégories de véhicules$|^Catégories véhicules$|^Vehicle categories$|^Categorías de vehículos$/i;
const CRUISES_DESCRIPTION =
  /Départs programmés|Scheduled sailings|Salidas programados/i;
const CRUISE_PORTS_DESCRIPTION = /Référentiel des escales|Ports directory|Referencia de escalas/i;
const CRUISE_LINES_DESCRIPTION = /Référentiel des compagnies|Cruise lines directory|Referencia de líneas/i;
const ACTIVITY_PROVIDERS_HEADING =
  /^Partenaires d'activités$|^Activity providers$|^Socios de actividades$/i;
const GAP_SETTINGS_DESCRIPTION =
  /Paramètres du site GAP|GAP site settings|Configuración del sitio GAP/i;
const GAP_PAGES_TABLE = /Liste des pages GAP|GAP pages list|Lista de páginas GAP/i;
const GAP_ACCESS_DENIED =
  /n'avez pas la permission gap\.read|do not have gap\.read permission|no tiene permiso gap\.read/i;

test.describe('Phase 4 QA — checklist verticals', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await loginAsSeedAdmin(page);
  });

  test('H4 + V3 — grilles disponibilités chambres et classes vol', async ({ page }) => {
    await page.goto(roomAvailabilityPath());
    await waitForPageIdle(page);
    await ensureAvailabilityMonth(page);

    const roomGrid = page.getByRole('grid').first();
    await expect(roomGrid).toBeVisible();
    await expect(page.getByRole('button', { name: AVAILABILITY_PREVIOUS_MONTH })).toBeVisible();
    await expect(page.getByRole('button', { name: AVAILABILITY_NEXT_MONTH })).toBeVisible();
    await expect(roomGrid.locator('.bg-atg-danger-light').first()).toBeVisible();
    await expect(roomGrid.locator('.bg-atg-success-light').first()).toBeVisible();
    await expect(
      roomGrid.getByRole('gridcell', { name: new RegExp(`\\b1\\b`, 'i') }),
    ).toBeVisible();

    await page.goto(flightClassAvailabilityPath());
    await waitForPageIdle(page);
    await ensureAvailabilityMonth(page);

    const flightGrid = page.getByRole('grid').first();
    await expect(flightGrid).toBeVisible();
    await expect(flightGrid.locator('.bg-atg-success-light').first()).toBeVisible();
  });

  test('V1 + C2 — timeline vol et escales croisière', async ({ page }) => {
    await page.goto(flightViewPath());
    await waitForPageIdle(page);

    const flightTimeline = page.getByRole('group', { name: FLIGHT_TIMELINE_ARIA }).first();
    await expect(flightTimeline).toBeVisible();
    await expect(flightTimeline.getByText(SEED_AIRPORT_FIH)).toBeVisible();
    await expect(flightTimeline.getByText(SEED_AIRPORT_NBO)).toBeVisible();

    await page.goto(itineraryPortsPath());
    await waitForPageIdle(page);

    const portsTimeline = page.getByRole('group', { name: CRUISE_PORTS_TIMELINE_ARIA });
    await expect(portsTimeline).toBeVisible();
    await expect(
      portsTimeline.getByText(SEED_CRUISE_PORT_KIN_NAME).locator('visible=true'),
    ).toBeVisible();
    await expect(
      portsTimeline.getByText(SEED_CRUISE_PORT_BNW_NAME).locator('visible=true'),
    ).toBeVisible();
  });

  test('AC1 — galerie photos activité', async ({ page }) => {
    await page.goto(activityEditPath());
    await waitForPageIdle(page);

    await expect(page.getByRole('heading', { name: ACTIVITY_PHOTOS_HEADING })).toBeVisible();
    await expect(page.getByRole('button', { name: ACTIVITY_ADD_PHOTO })).toBeVisible();

    const gallery = page.getByRole('list', { name: IMAGES_GALLERY_ARIA });
    await expect(gallery).toBeVisible();
    await expect(gallery.getByRole('listitem').first()).toBeVisible();
    await expect(
      gallery.getByRole('button', { name: /Modifier|Edit|Editar/i }).first(),
    ).toBeVisible();
  });

  test('P1 — composition forfait visuelle', async ({ page }) => {
    await page.goto(packageViewPath());
    await waitForPageIdle(page);

    const composition = page.getByRole('list', { name: PACKAGE_COMPOSITION_ARIA });
    await expect(composition).toBeVisible();
    await expect(composition.getByRole('listitem')).toHaveCount(1);
  });

  test('DE1 — hero destination', async ({ page }) => {
    await page.goto(destinationViewPath());
    await waitForPageIdle(page);

    const hero = page.getByRole('region', {
      name: DESTINATION_HERO_ARIA(SEED_DESTINATION_NAME),
    });
    await expect(hero).toBeVisible();
    await expect(hero.getByRole('heading', { name: SEED_DESTINATION_NAME })).toBeVisible();
    await expect(hero.getByText('CD')).toBeVisible();
  });

  test('GAP — contenu admin cohérent avec la vitrine', async ({ page }) => {
    await page.goto('/gap/pages');
    await waitForPageIdle(page);
    test.skip(
      (await page.getByText(GAP_ACCESS_DENIED).count()) > 0,
      'Permissions gap.read absentes sur ce compte',
    );
    await expect(page.getByRole('table', { name: GAP_PAGES_TABLE })).toBeVisible();
    await expect(
      page.getByRole('table', { name: GAP_PAGES_TABLE }).getByText(SEED_GAP_PAGE_ABOUT_TITLE).first(),
    ).toBeVisible();

    await page.goto('/gap/activites');
    await waitForPageIdle(page);
    const activitiesTable = page.getByRole('table').first();
    await expect(activitiesTable).toBeVisible();
    await expect(activitiesTable.getByText(SEED_GAP_ACTIVITY_TITLE)).toBeVisible();

    await page.goto('/gap/impact');
    await waitForPageIdle(page);
    const impactTable = page.getByRole('table').first();
    await expect(impactTable).toBeVisible();
    await expect(impactTable.getByText(SEED_GAP_IMPACT_LABEL)).toBeVisible();
    await expect(impactTable.getByText(SEED_GAP_IMPACT_VALUE).first()).toBeVisible();

    await page.goto('/gap/medias');
    await waitForPageIdle(page);
    const mediaTable = page.getByRole('table').first();
    await expect(mediaTable).toBeVisible();
    await expect(mediaTable.getByText(SEED_GAP_MEDIA_TITLE)).toBeVisible();

    await gotoGap(page, '/');
    await expect(page.getByText(SEED_GAP_SITE_TITLE).first()).toBeVisible();
    await expect(page.getByText(SEED_GAP_IMPACT_VALUE).first()).toBeVisible();
    await expect(page.getByText(SEED_GAP_ACTIVITY_TITLE).first()).toBeVisible();

    await gotoGap(page, '/about');
    await expect(page.getByText(SEED_GAP_PAGE_ABOUT_TITLE).first()).toBeVisible({
      timeout: 30_000,
    });

    await gotoGap(page, '/activities');
    await expect(page.getByText(SEED_GAP_ACTIVITY_TITLE).first()).toBeVisible();

    await gotoAdmin(page);
  });
});

test.describe('Phase 4 QA — smoke navigation verticals', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await loginAsSeedAdmin(page);
  });

  test('/hebergements et /hebergements/equipements', async ({ page }) => {
    await page.goto('/hebergements');
    await waitForPageIdle(page);
    await expect(page.getByRole('heading', { name: ACCOMMODATIONS_HEADING }).first()).toBeVisible();
    await expect(page.getByRole('table').first()).toBeVisible();

    await page.goto('/hebergements/equipements');
    await waitForPageIdle(page);
    await expect(page).toHaveURL(/\/hebergements\/equipements/);
    await expect(page.getByText(AMENITIES_DESCRIPTION).first()).toBeVisible();
    await page.getByRole('button', { name: AMENITIES_TABLE_VIEW }).click();
    await expect(page.getByRole('table').first()).toBeVisible();
  });

  test('/produits/vols/compagnies et /produits/vols/aeroports', async ({ page }) => {
    await page.goto('/produits/vols/compagnies');
    await waitForPageIdle(page);
    await expect(page.getByRole('heading', { name: AIRLINES_HEADING }).first()).toBeVisible();
    await expect(page.getByRole('table').first()).toBeVisible();

    await page.goto('/produits/vols/aeroports');
    await waitForPageIdle(page);
    await expect(page.getByRole('heading', { name: AIRPORTS_HEADING }).first()).toBeVisible();
    await expect(page.getByRole('table').first()).toBeVisible();
  });

  test('/produits/locations, agences et catégories', async ({ page }) => {
    await page.goto('/produits/locations');
    await waitForPageIdle(page);
    await expect(page.getByRole('heading', { name: VEHICLES_HEADING }).first()).toBeVisible();
    await expect(page.getByRole('table').first()).toBeVisible();

    await page.goto('/produits/locations/agences');
    await waitForPageIdle(page);
    await expect(page.getByRole('heading', { name: AGENCIES_HEADING }).first()).toBeVisible();
    await expect(page.getByRole('table').first()).toBeVisible();

    await page.goto('/produits/locations/categories');
    await waitForPageIdle(page);
    await expect(page.getByRole('heading', { name: CATEGORIES_HEADING }).first()).toBeVisible();
    await expect(page.getByRole('table').first()).toBeVisible();
  });

  test('/produits/croisieres, ports et lignes', async ({ page }) => {
    await page.goto('/produits/croisieres');
    await waitForPageIdle(page);
    await expect(page.getByText(CRUISES_DESCRIPTION).first()).toBeVisible();
    await expect(page.getByRole('table').first()).toBeVisible();

    await page.goto('/produits/croisieres/ports');
    await waitForPageIdle(page);
    await expect(page.getByText(CRUISE_PORTS_DESCRIPTION).first()).toBeVisible();
    await expect(page.getByRole('table').first()).toBeVisible();

    await page.goto('/produits/croisieres/lignes');
    await waitForPageIdle(page);
    await expect(page.getByText(CRUISE_LINES_DESCRIPTION).first()).toBeVisible();
    await expect(page.getByRole('table').first()).toBeVisible();
  });

  test('/produits/activites/fournisseurs', async ({ page }) => {
    await page.goto('/produits/activites/fournisseurs');
    await waitForPageIdle(page);
    await expect(
      page.getByRole('heading', { name: ACTIVITY_PROVIDERS_HEADING }).first(),
    ).toBeVisible();
    await expect(page.getByRole('table').first()).toBeVisible();
  });

  test('/produits/vols — liste principale', async ({ page }) => {
    await page.goto('/produits/vols');
    await waitForPageIdle(page);
    await expect(page.getByRole('heading', { name: FLIGHTS_HEADING }).first()).toBeVisible();
    await expect(page.getByRole('table').first()).toBeVisible();
  });

  test('/gap/parametres', async ({ page }) => {
    await page.goto('/gap/parametres');
    await waitForPageIdle(page);
    test.skip(
      (await page.getByText(GAP_ACCESS_DENIED).count()) > 0,
      'Permissions gap.read absentes sur ce compte',
    );
    await expect(page.getByText(GAP_SETTINGS_DESCRIPTION).first()).toBeVisible();
    await expect(page.getByLabel(/Titre|Title|Título/i).first()).toBeVisible();
  });
});
