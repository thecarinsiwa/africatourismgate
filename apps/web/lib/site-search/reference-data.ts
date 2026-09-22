import type { PublicDestination } from '@africatourismgate/types';
import {
  listPublicAirports,
  listPublicDestinations,
  listVehiclePickupLocations,
} from '../api/public';
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

const destinationsCache = createTimedCache(listPublicDestinations);
const airportsCache = createTimedCache(listPublicAirports);
const pickupLocationsCache = createTimedCache(listVehiclePickupLocations);

export function getCachedDestinations(): Promise<PublicDestination[]> {
  return destinationsCache.get();
}

export function getCachedAirports(): Promise<PublicAirport[]> {
  return airportsCache.get();
}

export function getCachedPickupLocations(): Promise<PublicDestination[]> {
  return pickupLocationsCache.get();
}

/** Vide les trois caches (tests / hot-reload). */
export function resetSiteSearchReferenceCaches(): void {
  destinationsCache.reset();
  airportsCache.reset();
  pickupLocationsCache.reset();
}
