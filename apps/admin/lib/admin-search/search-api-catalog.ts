import type { ApiClient } from '@africatourismgate/api-client';
import { withApiClient } from '../auth/api';
import { formatMoney } from '../format-money';
import {
  adminSearchDeepLinks,
  formatAdminSearchIdPrefix,
  formatAdminSearchPersonName,
} from './deep-links';
import { buildAdminSearchResultId } from './sources';
import type { AdminSearchResultItem } from './types';
import type { SearchApiCoreOptions } from './search-api-core';

const DEFAULT_LIMIT = 5;
const CLIENT_FILTER_FETCH_LIMIT = 100;

function resolveLimit(options?: SearchApiCoreOptions): number {
  return options?.resultLimit ?? DEFAULT_LIMIT;
}

export async function searchAdminActivities(
  query: string,
  options?: SearchApiCoreOptions,
): Promise<AdminSearchResultItem[]> {
  const limit = resolveLimit(options);
  const result = await withApiClient((client: ApiClient) =>
    client.listActivities({
      page: 1,
      limit,
      search: query.trim() || undefined,
    }),
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
    client.listFlights({
      page: 1,
      limit,
      search: query.trim() || undefined,
    }),
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
    client.listVehicles({
      page: 1,
      limit,
      search: query.trim() || undefined,
    }),
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
    client.listPackages({
      page: 1,
      limit,
      search: query.trim() || undefined,
    }),
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
 * Les départs croisière n’ont pas de `search` API : fetch + jointure
 * itinéraires + filtre client (date / nom itinéraire / id).
 */
export async function searchAdminSailings(
  query: string,
  options?: SearchApiCoreOptions,
): Promise<AdminSearchResultItem[]> {
  const limit = resolveLimit(options);
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [];
  }

  const [sailingsResult, itinerariesResult] = await withApiClient(
    (client: ApiClient) =>
      Promise.all([
        client.listCruiseSailings({
          page: 1,
          limit: CLIENT_FILTER_FETCH_LIMIT,
        }),
        client.listItineraries({
          page: 1,
          limit: CLIENT_FILTER_FETCH_LIMIT,
        }),
      ]),
  );

  const itineraryNameById = new Map(
    itinerariesResult.data.map((itinerary) => [itinerary.id, itinerary.name]),
  );

  return sailingsResult.data
    .filter((sailing) => {
      const itineraryName = itineraryNameById.get(sailing.itineraryId) ?? '';
      const haystacks = [
        sailing.departureDate,
        itineraryName,
        sailing.id,
        sailing.itineraryId,
      ];
      return haystacks.some((value) =>
        value.toLowerCase().includes(normalized),
      );
    })
    .slice(0, limit)
    .map((sailing) => {
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
    client.listBlogPosts({
      page: 1,
      limit,
      search: query.trim() || undefined,
    }),
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
    client.listDestinations({
      page: 1,
      limit,
      search: query.trim() || undefined,
    }),
  );

  return result.data.map((destination) => ({
    id: buildAdminSearchResultId('destinations', destination.id),
    sourceId: 'destinations' as const,
    group: 'content' as const,
    title: destination.name,
    subtitle: `${destination.countryCode} · ${destination.slug}`,
    href: adminSearchDeepLinks.destination(destination.id),
  }));
}

export async function searchAdminEmployees(
  query: string,
  options?: SearchApiCoreOptions,
): Promise<AdminSearchResultItem[]> {
  const limit = resolveLimit(options);
  const result = await withApiClient((client: ApiClient) =>
    client.listEmployees({
      page: 1,
      limit,
      search: query.trim() || undefined,
    }),
  );

  return result.data.map((employee) => {
    const user = employee.user;
    const name = user
      ? formatAdminSearchPersonName(
          user.firstName,
          user.lastName,
          user.email,
        )
      : employee.employeeCode?.trim() ||
        formatAdminSearchIdPrefix(employee.id);
    return {
      id: buildAdminSearchResultId('employees', employee.id),
      sourceId: 'employees' as const,
      group: 'content' as const,
      title: name,
      subtitle:
        employee.jobTitle?.trim() ||
        employee.employeeCode?.trim() ||
        user?.email ||
        employee.status,
      href: adminSearchDeepLinks.employee(employee.id),
    };
  });
}
