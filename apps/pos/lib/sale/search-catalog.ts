import type {
  Activity,
  Cabin,
  Flight,
  Property,
  Vehicle,
} from '@africatourismgate/types';
import { getValidApiClient } from '../auth/api';
import { requireSelectedOrganizationId } from '../auth/session';
import { formatCents } from './format';
import type { SaleCatalogFilter, SaleCatalogHit } from './types';

const SEARCH_LIMIT = 15;
const ROOM_PROPERTY_LIMIT = 5;
/** Propriétés / vols org-scopés pour recherche par nom de chambre / classe. */
const BROAD_PARENT_LIMIT = 30;

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

function matchesQuery(text: string, query: string): boolean {
  if (!query) return true;
  return text.toLowerCase().includes(query);
}

function sortHits(hits: SaleCatalogHit[]): SaleCatalogHit[] {
  return [...hits].sort((a, b) => a.title.localeCompare(b.title, 'fr'));
}

async function searchActivities(query: string): Promise<SaleCatalogHit[]> {
  const organizationId = requireSelectedOrganizationId();
  const client = await getValidApiClient();
  const response = await client.listActivities({
    search: query || undefined,
    limit: SEARCH_LIMIT,
    organizationId,
  });

  return response.data.map((activity: Activity) => ({
    hitId: `activity-${activity.id}`,
    kind: 'activity' as const,
    activity,
    title: activity.title,
    subtitle: activity.durationMinutes
      ? `${activity.durationMinutes} min · ${formatCents(activity.priceCents, activity.currency)}`
      : formatCents(activity.priceCents, activity.currency),
    priceCents: activity.priceCents,
    currency: activity.currency,
  }));
}

async function searchRooms(query: string): Promise<SaleCatalogHit[]> {
  const organizationId = requireSelectedOrganizationId();
  const client = await getValidApiClient();
  const propertyMap = new Map<string, Property>();

  const primary = await client.listProperties({
    search: query || undefined,
    limit: ROOM_PROPERTY_LIMIT,
    organizationId,
  });
  for (const property of primary.data) {
    propertyMap.set(property.id, property);
  }

  // Recherche par nom de chambre : élargir via propriétés org-scopées (pas listRooms global).
  if (query && propertyMap.size < ROOM_PROPERTY_LIMIT) {
    const broader = await client.listProperties({
      limit: BROAD_PARENT_LIMIT,
      organizationId,
    });
    for (const property of broader.data) {
      propertyMap.set(property.id, property);
    }
  }

  const hits: SaleCatalogHit[] = [];

  await Promise.all(
    [...propertyMap.values()].map(async (property) => {
      const rooms = await client.listRooms({
        propertyId: property.id,
        limit: SEARCH_LIMIT,
      });
      for (const room of rooms.data) {
        const label = `${property.name} — ${room.name}`;
        if (query && !matchesQuery(label, query) && !matchesQuery(room.name, query)) {
          continue;
        }
        hits.push({
          hitId: `room-${room.id}`,
          kind: 'room',
          room,
          propertyName: property.name,
          title: room.name,
          subtitle: `${property.name} · ${formatCents(room.basePriceCents, room.currency)} / nuit`,
          priceCents: room.basePriceCents,
          currency: room.currency,
        });
      }
    }),
  );

  return hits.slice(0, SEARCH_LIMIT);
}

async function searchFlightClasses(query: string): Promise<SaleCatalogHit[]> {
  const organizationId = requireSelectedOrganizationId();
  const client = await getValidApiClient();
  const flightById = new Map<string, Flight>();

  const primary = await client.listFlights({
    search: query || undefined,
    limit: SEARCH_LIMIT,
    organizationId,
  });
  for (const flight of primary.data) {
    flightById.set(flight.id, flight);
  }

  // Recherche par nom de classe : élargir via vols org-scopés (pas listFlightClasses global).
  if (query && flightById.size < SEARCH_LIMIT) {
    const broader = await client.listFlights({
      limit: BROAD_PARENT_LIMIT,
      organizationId,
    });
    for (const flight of broader.data) {
      flightById.set(flight.id, flight);
    }
  }

  const hits: SaleCatalogHit[] = [];

  for (const flight of flightById.values()) {
    if (hits.length >= SEARCH_LIMIT) break;
    const classes = await client.listFlightClasses({
      flightId: flight.id,
      limit: 10,
    });
    for (const flightClass of classes.data) {
      if (hits.length >= SEARCH_LIMIT) break;
      const label = `${flight.flightNumber} ${flightClass.className}`;
      if (query && !matchesQuery(label, query) && !matchesQuery(flightClass.className, query)) {
        continue;
      }
      hits.push({
        hitId: `flight_class-${flightClass.id}`,
        kind: 'flight_class',
        flightClass,
        flight,
        flightLabel: flight.flightNumber,
        title: `${flight.flightNumber} · ${flightClass.className}`,
        subtitle: `À partir de ${formatCents(flightClass.basePriceCents, 'USD')}`,
        priceCents: flightClass.basePriceCents,
        currency: 'USD',
      });
    }
  }

  return hits.slice(0, SEARCH_LIMIT);
}

async function searchVehicles(query: string): Promise<SaleCatalogHit[]> {
  const organizationId = requireSelectedOrganizationId();
  const client = await getValidApiClient();
  const response = await client.listVehicles({
    search: query || undefined,
    limit: SEARCH_LIMIT,
    organizationId,
  });

  return response.data.map((vehicle: Vehicle) => ({
    hitId: `vehicle-${vehicle.id}`,
    kind: 'vehicle' as const,
    vehicle,
    title: vehicle.licensePlate ?? `Véhicule ${vehicle.id.slice(0, 8)}`,
    subtitle: `${formatCents(vehicle.dailyPriceCents, vehicle.currency)} / jour`,
    priceCents: vehicle.dailyPriceCents,
    currency: vehicle.currency,
  }));
}

async function searchCabins(query: string): Promise<SaleCatalogHit[]> {
  const organizationId = requireSelectedOrganizationId();
  const client = await getValidApiClient();
  const response = await client.listCabins({
    limit: BROAD_PARENT_LIMIT,
    organizationId,
  });

  const filtered = response.data.filter((cabin: Cabin) => {
    if (!query) return true;
    return matchesQuery(cabin.categoryName, query);
  });

  return filtered.slice(0, SEARCH_LIMIT).map((cabin) => ({
    hitId: `cabin-${cabin.id}`,
    kind: 'cabin' as const,
    cabin,
    title: cabin.categoryName,
    subtitle: `${cabin.maxGuests} pers. · ${formatCents(cabin.basePriceCents, cabin.currency)}`,
    priceCents: cabin.basePriceCents,
    currency: cabin.currency,
  }));
}

const SEARCHERS: Record<
  Exclude<SaleCatalogFilter, 'all'>,
  (query: string) => Promise<SaleCatalogHit[]>
> = {
  activity: searchActivities,
  room: searchRooms,
  flight_class: searchFlightClasses,
  vehicle: searchVehicles,
  cabin: searchCabins,
};

export async function searchCatalog(
  query: string,
  filter: SaleCatalogFilter,
): Promise<SaleCatalogHit[]> {
  const normalized = normalizeQuery(query);

  if (normalized.length < 2) {
    if (filter !== 'all') {
      const hits = await SEARCHERS[filter]('');
      return sortHits(hits);
    }
    return fetchInitialCatalog();
  }

  if (filter !== 'all') {
    const hits = await SEARCHERS[filter](normalized);
    return sortHits(hits);
  }

  const results = await Promise.allSettled(
    (Object.keys(SEARCHERS) as Exclude<SaleCatalogFilter, 'all'>[]).map((kind) =>
      SEARCHERS[kind](normalized),
    ),
  );

  const merged: SaleCatalogHit[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      merged.push(...result.value);
    }
  }

  return sortHits(merged).slice(0, SEARCH_LIMIT * 2);
}

/** Produits disponibles au chargement de la page (sans recherche). */
export async function fetchInitialCatalog(): Promise<SaleCatalogHit[]> {
  const results = await Promise.allSettled(
    (Object.keys(SEARCHERS) as Exclude<SaleCatalogFilter, 'all'>[]).map((kind) =>
      SEARCHERS[kind](''),
    ),
  );

  const merged: SaleCatalogHit[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      merged.push(...result.value);
    }
  }

  return sortHits(merged).slice(0, SEARCH_LIMIT * 2);
}
