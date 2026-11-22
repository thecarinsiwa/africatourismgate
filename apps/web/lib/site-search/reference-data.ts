import type {
  PublicDestination,
  VehicleRouteOption,
} from '@africatourismgate/types';
import type { PublicAirport } from '../flights/types';

/** TTL par défaut des listes de référence (5 minutes). */
export const SITE_SEARCH_REFERENCE_TTL_MS = 5 * 60 * 1000;

type TimedCacheOptions = {
  ttlMs?: number;
  /** Horloge injectable (tests). */
  now?: () => number;
};

type TimedCache<T> = {
  get: () => Promise<T>;
  reset: () => void;
};

/**
 * Cache mémoire avec TTL + déduplication des requêtes en vol.
 * En cas d’échec réseau, rien n’est mis en cache : le prochain appel retente.
 */
export function createTimedCache<T>(
  load: () => Promise<T>,
  options?: TimedCacheOptions,
): TimedCache<T> {
  const ttlMs = options?.ttlMs ?? SITE_SEARCH_REFERENCE_TTL_MS;
  const now = options?.now ?? Date.now;

  let data: T | null = null;
  let expiresAt = 0;
  let inflight: Promise<T> | null = null;

  return {
    async get() {
      if (data !== null && now() < expiresAt) {
        return data;
      }
      if (inflight) {
        return inflight;
      }

      inflight = load()
        .then((value) => {
          data = value;
          expiresAt = now() + ttlMs;
          return value;
        })
        .finally(() => {
          inflight = null;
        });

      return inflight;
    },
    reset() {
      data = null;
      expiresAt = 0;
      inflight = null;
    },
  };
}

type ReferenceCaches = {
  destinations: TimedCache<PublicDestination[]>;
  airports: TimedCache<PublicAirport[]>;
  vehicleRouteOptions: TimedCache<VehicleRouteOption[]>;
};

let caches: ReferenceCaches | null = null;

async function getCaches(): Promise<ReferenceCaches> {
  if (caches) {
    return caches;
  }

  // Lazy import so unit tests of `createTimedCache` do not load the API/UI graph.
  const api = await import('../api/public');
  caches = {
    destinations: createTimedCache(api.listPublicDestinations),
    airports: createTimedCache(api.listPublicAirports),
    vehicleRouteOptions: createTimedCache(api.listVehicleRouteOptions),
  };
  return caches;
}

export async function getCachedDestinations(): Promise<PublicDestination[]> {
  const { destinations } = await getCaches();
  return destinations.get();
}

export async function getCachedAirports(): Promise<PublicAirport[]> {
  const { airports } = await getCaches();
  return airports.get();
}

export async function getCachedVehicleRouteOptions(): Promise<
  VehicleRouteOption[]
> {
  const { vehicleRouteOptions } = await getCaches();
  return vehicleRouteOptions.get();
}

/** Vide les caches de référence (tests / hot-reload). */
export function resetSiteSearchReferenceCaches(): void {
  caches?.destinations.reset();
  caches?.airports.reset();
  caches?.vehicleRouteOptions.reset();
  caches = null;
}
