/**
 * Collecte des comptes catalogue « Mise en route » via ApiClient.
 * Fan-out `Promise.allSettled` — une ressource en erreur n’empêche pas les autres.
 * Les seuils / verrous modules sont dans setup-progress (s03).
 */

import type { ApiClient } from '@africatourismgate/api-client';
import {
  normalizeWebPaymentMethods,
  WEB_PAYMENT_METHOD_KEYS,
  type ResolvedWebPaymentMethods,
} from '@africatourismgate/types';
import { PLATFORM_ORG_ID } from '../org-settings-constants';
import {
  getSetupListResourcesUsed,
  getAllSetupSteps,
  type SetupListResource,
  type SetupSettingsPath,
} from './setup-catalog';

const LIST_QUERY = { page: 1, limit: 1 } as const;

export type SetupPaginatedLike = {
  meta: { total: number };
};

/** Extrait et valide `meta.total` (tests unitaires). */
export function parsePaginatedTotal(response: SetupPaginatedLike): number {
  const total = response.meta?.total;
  if (typeof total !== 'number' || !Number.isFinite(total) || total < 0) {
    throw new Error('Invalid pagination meta.total');
  }
  return Math.floor(total);
}

type SetupListFetcher = (client: ApiClient) => Promise<number>;

/**
 * Map resource catalogue → appel list ApiClient (limit 1) → meta.total.
 * Exhaustif sur `SetupListResource`.
 */
export const SETUP_LIST_FETCHERS: Record<SetupListResource, SetupListFetcher> = {
  organizations: async (client) =>
    parsePaginatedTotal(await client.listOrganizations(LIST_QUERY)),
  amenities: async (client) =>
    parsePaginatedTotal(await client.listAmenities(LIST_QUERY)),
  vehicleCategories: async (client) =>
    parsePaginatedTotal(await client.listVehicleCategories(LIST_QUERY)),
  destinations: async (client) =>
    parsePaginatedTotal(await client.listDestinations(LIST_QUERY)),
  pointsOfInterest: async (client) =>
    parsePaginatedTotal(await client.listPointsOfInterest(LIST_QUERY)),
  properties: async (client) =>
    parsePaginatedTotal(await client.listProperties(LIST_QUERY)),
  rooms: async (client) =>
    parsePaginatedTotal(await client.listRooms(LIST_QUERY)),
  airlines: async (client) =>
    parsePaginatedTotal(await client.listAirlines(LIST_QUERY)),
  airports: async (client) =>
    parsePaginatedTotal(await client.listAirports(LIST_QUERY)),
  flights: async (client) =>
    parsePaginatedTotal(await client.listFlights(LIST_QUERY)),
  rentalAgencies: async (client) =>
    parsePaginatedTotal(await client.listRentalAgencies(LIST_QUERY)),
  vehicles: async (client) =>
    parsePaginatedTotal(await client.listVehicles(LIST_QUERY)),
  cruiseLines: async (client) =>
    parsePaginatedTotal(await client.listCruiseLines(LIST_QUERY)),
  cruisePorts: async (client) =>
    parsePaginatedTotal(await client.listCruisePorts(LIST_QUERY)),
  ships: async (client) =>
    parsePaginatedTotal(await client.listShips(LIST_QUERY)),
  cruiseSailings: async (client) =>
    parsePaginatedTotal(await client.listCruiseSailings(LIST_QUERY)),
  activityProviders: async (client) =>
    parsePaginatedTotal(await client.listActivityProviders(LIST_QUERY)),
  activities: async (client) =>
    parsePaginatedTotal(await client.listActivities(LIST_QUERY)),
  packages: async (client) =>
    parsePaginatedTotal(await client.listPackages(LIST_QUERY)),
  organizationBankAccounts: async (client) =>
    parsePaginatedTotal(await client.listOrganizationBankAccounts(LIST_QUERY)),
  mobileMoneyCountries: async (client) =>
    parsePaginatedTotal(await client.listMobileMoneyCountries(LIST_QUERY)),
  heroSlides: async (client) =>
    parsePaginatedTotal(await client.listHeroSlides(LIST_QUERY)),
  aboutPages: async (client) =>
    parsePaginatedTotal(await client.listAboutPages(LIST_QUERY)),
  legalPages: async (client) =>
    parsePaginatedTotal(await client.listLegalPages(LIST_QUERY)),
  blogPosts: async (client) =>
    parsePaginatedTotal(await client.listBlogPosts(LIST_QUERY)),
  tourGuides: async (client) =>
    parsePaginatedTotal(await client.listTourGuides(LIST_QUERY)),
  promoCodes: async (client) =>
    parsePaginatedTotal(await client.listPromoCodes(LIST_QUERY)),
};

export async function fetchSetupListTotal(
  client: ApiClient,
  resource: SetupListResource,
): Promise<number> {
  return SETUP_LIST_FETCHERS[resource](client);
}

export type SetupReadinessOptions = {
  /** Org pour les checks settings (défaut : org de l’utilisateur / plateforme). */
  organizationId?: string;
  /** Sous-ensemble de ressources (défaut : celles utilisées par le catalogue). */
  resources?: readonly SetupListResource[];
  /** Sous-ensemble de chemins settings (défaut : ceux du catalogue). */
  settingsPaths?: readonly SetupSettingsPath[];
};

/** Snapshot : `null` = erreur / inconnu pour cette clé. */
export type SetupReadinessSnapshot = {
  totals: Record<SetupListResource, number | null>;
  settings: Record<SetupSettingsPath, boolean | null>;
};

function emptyTotals(): Record<SetupListResource, number | null> {
  return {
    organizations: null,
    amenities: null,
    vehicleCategories: null,
    destinations: null,
    pointsOfInterest: null,
    properties: null,
    rooms: null,
    airlines: null,
    airports: null,
    flights: null,
    rentalAgencies: null,
    vehicles: null,
    cruiseLines: null,
    cruisePorts: null,
    ships: null,
    cruiseSailings: null,
    activityProviders: null,
    activities: null,
    packages: null,
    organizationBankAccounts: null,
    mobileMoneyCountries: null,
    heroSlides: null,
    aboutPages: null,
    legalPages: null,
    blogPosts: null,
    tourGuides: null,
    promoCodes: null,
  };
}

function emptySettings(): Record<SetupSettingsPath, boolean | null> {
  return {
    'booking.payment_methods': null,
  };
}

/** Snapshot initial (toutes les clés `null`) — avant le fetch live (s09). */
export function createEmptySetupReadinessSnapshot(): SetupReadinessSnapshot {
  return {
    totals: emptyTotals(),
    settings: emptySettings(),
  };
}

export function getSetupSettingsPathsUsed(): readonly SetupSettingsPath[] {
  const seen = new Set<SetupSettingsPath>();
  for (const step of getAllSetupSteps()) {
    if (step.check.kind === 'settingsFlag') {
      seen.add(step.check.path);
    }
  }
  return Array.from(seen);
}

async function resolveOrganizationId(
  client: ApiClient,
  explicit?: string,
): Promise<string> {
  if (explicit) {
    return explicit;
  }
  const me = await client.getAuthMe();
  return me.user.organizationId ?? PLATFORM_ORG_ID;
}

/**
 * Évalue un flag settings catalogue.
 * `booking.payment_methods` : au moins un moyen activé (defaults inclus).
 */
export async function fetchSetupSettingsFlag(
  client: ApiClient,
  path: SetupSettingsPath,
  options?: { organizationId?: string },
): Promise<boolean> {
  switch (path) {
    case 'booking.payment_methods': {
      const organizationId = await resolveOrganizationId(
        client,
        options?.organizationId,
      );
      const page = await client.listOrganizationSettings({
        organizationId,
        page: 1,
        limit: 100,
      });
      const row = page.data.find(
        (setting) =>
          setting.settingGroup === 'booking' &&
          setting.settingKey === 'payment_methods',
      );
      const methods = normalizeWebPaymentMethods(
        row?.settingValue as Partial<ResolvedWebPaymentMethods> | undefined,
      );
      return WEB_PAYMENT_METHOD_KEYS.some((key) => methods[key] === true);
    }
    default: {
      const _exhaustive: never = path;
      throw new Error(`Unsupported setup settings path: ${String(_exhaustive)}`);
    }
  }
}

/**
 * Collecte tous les totaux + flags settings du catalogue en parallèle.
 * Les clés absentes du fan-out restent `null` (non demandées).
 */
export async function fetchSetupReadiness(
  client: ApiClient,
  options?: SetupReadinessOptions,
): Promise<SetupReadinessSnapshot> {
  const resources = options?.resources ?? getSetupListResourcesUsed();
  const settingsPaths = options?.settingsPaths ?? getSetupSettingsPathsUsed();

  const totals = emptyTotals();
  const settings = emptySettings();

  let organizationId = options?.organizationId;
  if (settingsPaths.length > 0 && !organizationId) {
    try {
      organizationId = await resolveOrganizationId(client);
    } catch {
      // Les flags settings resteront null via allSettled ci-dessous.
    }
  }

  const listJobs = resources.map(async (resource) => {
    const total = await fetchSetupListTotal(client, resource);
    return { resource, total } as const;
  });

  const settingsJobs = settingsPaths.map(async (path) => {
    const enabled = await fetchSetupSettingsFlag(client, path, {
      organizationId,
    });
    return { path, enabled } as const;
  });

  const [listSettled, settingsSettled] = await Promise.all([
    Promise.allSettled(listJobs),
    Promise.allSettled(settingsJobs),
  ]);

  for (const result of listSettled) {
    if (result.status === 'fulfilled') {
      totals[result.value.resource] = result.value.total;
    }
  }

  for (const result of settingsSettled) {
    if (result.status === 'fulfilled') {
      settings[result.value.path] = result.value.enabled;
    }
  }

  return { totals, settings };
}
