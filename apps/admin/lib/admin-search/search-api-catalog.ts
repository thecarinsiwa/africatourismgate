import type { ApiClient } from '@africatourismgate/api-client';
import { withApiClient } from '../auth/api';
import { formatMoney } from '../format-money';
import {
  adminSearchDeepLinks,
  formatAdminSearchIdPrefix,
} from './deep-links';
import { buildAdminSearchResultId } from './sources';
import type { AdminSearchResultItem } from './types';
import type { SearchApiCoreOptions } from './search-api-core';

const DEFAULT_LIMIT = 5;

function resolveLimit(options?: SearchApiCoreOptions): number {
  return options?.resultLimit ?? DEFAULT_LIMIT;
}

function requestOptions(
  options?: SearchApiCoreOptions,
): { signal: AbortSignal } | undefined {
  return options?.signal ? { signal: options.signal } : undefined;
}

export async function searchAdminActivities(
  query: string,
  options?: SearchApiCoreOptions,
): Promise<AdminSearchResultItem[]> {
  const limit = resolveLimit(options);
  const result = await withApiClient((client: ApiClient) =>
    client.listActivities(
      {
        page: 1,
        limit,
        search: query.trim() || undefined,
      },
      requestOptions(options),
    ),
  );

  return result.data.map((activity) => ({
    id: buildAdminSearchResultId('activities', activity.id),
    sourceId: 'activities' as const,
    group: 'catalog' as const,
    title: activity.title,
    subtitle: formatMoney(activity.priceCents, activity.currency),
    href: adminSearchDeepLinks.activity(activity.id),
  }));
}

export async function searchAdminFlights(
  query: string,
  options?: SearchApiCoreOptions,
): Promise<AdminSearchResultItem[]> {
  const limit = resolveLimit(options);
  const result = await withApiClient((client: ApiClient) =>
    client.listFlights(
      {
        page: 1,
        limit,
        search: query.trim() || undefined,
      },
      requestOptions(options),
    ),
  );

  return result.data.map((flight) => ({
    id: buildAdminSearchResultId('flights', flight.id),
    sourceId: 'flights' as const,
    group: 'catalog' as const,
    title: flight.flightNumber,
    subtitle: `${flight.departureTime} → ${flight.arrivalTime}`,
    href: adminSearchDeepLinks.flight(flight.id),
  }));
}

export async function searchAdminVehicles(
  query: string,
  options?: SearchApiCoreOptions,
): Promise<AdminSearchResultItem[]> {
  const limit = resolveLimit(options);
  const result = await withApiClient((client: ApiClient) =>
    client.listVehicles(
      {
        page: 1,
        limit,
        search: query.trim() || undefined,
      },
      requestOptions(options),
    ),
  );

  return result.data.map((vehicle) => {
    const plate = vehicle.licensePlate?.trim();
    return {
      id: buildAdminSearchResultId('vehicles', vehicle.id),
      sourceId: 'vehicles' as const,
      group: 'catalog' as const,
      title: plate || formatAdminSearchIdPrefix(vehicle.id),
      subtitle: formatMoney(vehicle.dailyPriceCents, vehicle.currency),
      href: adminSearchDeepLinks.vehicle(vehicle.id),
    };
  });
}

export async function searchAdminPackages(
  query: string,
  options?: SearchApiCoreOptions,
): Promise<AdminSearchResultItem[]> {
  const limit = resolveLimit(options);
  const result = await withApiClient((client: ApiClient) =>
    client.listPackages(
      {
        page: 1,
        limit,
        search: query.trim() || undefined,
      },
      requestOptions(options),
    ),
  );

  return result.data.map((pkg) => ({
    id: buildAdminSearchResultId('packages', pkg.id),
    sourceId: 'packages' as const,
    group: 'catalog' as const,
    title: pkg.name,
    subtitle: `${pkg.durationDays}j · −${pkg.discountPercent}%`,
    href: adminSearchDeepLinks.package(pkg.id),
  }));
}

/**
 * Départs croisière via `search=` API (date, id, nom d’itinéraire).
 * Les noms d’itinéraire sont résolus pour les résultats retournés uniquement.
 */
export async function searchAdminSailings(
  query: string,
  options?: SearchApiCoreOptions,
): Promise<AdminSearchResultItem[]> {
  const limit = resolveLimit(options);
  const search = query.trim();
  if (!search) {
    return [];
  }

  const sailingsResult = await withApiClient((client: ApiClient) =>
    client.listCruiseSailings(
      {
        page: 1,
        limit,
        search,
      },
      requestOptions(options),
    ),
  );

  const itineraryIds = Array.from(
    new Set(sailingsResult.data.map((sailing) => sailing.itineraryId)),
  );
  const itineraryNameById = new Map<string, string>();

  if (itineraryIds.length > 0) {
    await withApiClient(async (client: ApiClient) => {
      await Promise.all(
        itineraryIds.map(async (id) => {
          try {
            const itinerary = await client.getItinerary(id);
            itineraryNameById.set(id, itinerary.name);
          } catch {
            /* ignore missing itinerary for label */
          }
        }),
      );
    });
  }

  return sailingsResult.data.map((sailing) => {
    const itineraryName = itineraryNameById.get(sailing.itineraryId);
    return {
      id: buildAdminSearchResultId('sailings', sailing.id),
      sourceId: 'sailings' as const,
      group: 'catalog' as const,
      title: itineraryName
        ? `${itineraryName} — ${sailing.departureDate}`
        : sailing.departureDate,
      subtitle: formatAdminSearchIdPrefix(sailing.id),
      href: adminSearchDeepLinks.sailing(sailing.id),
    };
  });
}

export async function searchAdminBlogPosts(
  query: string,
  options?: SearchApiCoreOptions,
): Promise<AdminSearchResultItem[]> {
  const limit = resolveLimit(options);
  const result = await withApiClient((client: ApiClient) =>
    client.listBlogPosts(
      {
        page: 1,
        limit,
        search: query.trim() || undefined,
      },
      requestOptions(options),
    ),
  );

  return result.data.map((post) => ({
    id: buildAdminSearchResultId('blogPosts', post.id),
    sourceId: 'blogPosts' as const,
    group: 'content' as const,
    title: post.title,
    subtitle: `${post.status} · ${post.locale}`,
    href: adminSearchDeepLinks.blogPost(post.id),
  }));
}

export async function searchAdminDestinations(
  query: string,
  options?: SearchApiCoreOptions,
): Promise<AdminSearchResultItem[]> {
  const limit = resolveLimit(options);
  const result = await withApiClient((client: ApiClient) =>
    client.listDestinations(
      {
        page: 1,
        limit,
        search: query.trim() || undefined,
      },
      requestOptions(options),
    ),
  );

  return result.data.map((destination) => ({
    id: buildAdminSearchResultId('destinations', destination.id),
    sourceId: 'destinations' as const,
    group: 'catalog' as const,
    title: destination.name,
    subtitle: `${destination.countryCode} · ${destination.slug}`,
    href: adminSearchDeepLinks.destination(destination.id),
  }));
}

export async function searchAdminTourGuides(
  query: string,
  options?: SearchApiCoreOptions,
): Promise<AdminSearchResultItem[]> {
  const limit = resolveLimit(options);
  const result = await withApiClient((client: ApiClient) =>
    client.listTourGuides(
      {
        page: 1,
        limit,
        search: query.trim() || undefined,
      },
      requestOptions(options),
    ),
  );

  return result.data.map((guide) => ({
    id: buildAdminSearchResultId('tourGuides', guide.id),
    sourceId: 'tourGuides' as const,
    group: 'content' as const,
    title: guide.displayName,
    subtitle:
      guide.contactEmail?.trim() ||
      guide.user?.email ||
      guide.status,
    href: adminSearchDeepLinks.tourGuide(guide.id),
  }));
}

export async function searchAdminGapPages(
  query: string,
  options?: SearchApiCoreOptions,
): Promise<AdminSearchResultItem[]> {
  const limit = resolveLimit(options);
  const result = await withApiClient((client: ApiClient) =>
    client.listGapPages(
      {
        page: 1,
        limit,
        search: query.trim() || undefined,
      },
      requestOptions(options),
    ),
  );

  return result.data.map((page) => ({
    id: buildAdminSearchResultId('gapPages', page.id),
    sourceId: 'gapPages' as const,
    group: 'content' as const,
    title: page.title,
    subtitle: `${page.status} · ${page.locale}`,
    href: adminSearchDeepLinks.gapPage(page.id),
  }));
}

export async function searchAdminGapActivities(
  query: string,
  options?: SearchApiCoreOptions,
): Promise<AdminSearchResultItem[]> {
  const limit = resolveLimit(options);
  const result = await withApiClient((client: ApiClient) =>
    client.listGapActivities(
      {
        page: 1,
        limit,
        search: query.trim() || undefined,
      },
      requestOptions(options),
    ),
  );

  return result.data.map((activity) => ({
    id: buildAdminSearchResultId('gapActivities', activity.id),
    sourceId: 'gapActivities' as const,
    group: 'content' as const,
    title: activity.title,
    subtitle: `${activity.status} · ${activity.locale}`,
    href: adminSearchDeepLinks.gapActivity(activity.id),
  }));
}
