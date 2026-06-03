import type {
  PropertySearchQuery,
  AirlinesListQuery,
  AirportsListQuery,
  AmenitiesListQuery,
  DestinationsListQuery,
  FlightClassAvailabilityListQuery,
  FlightClassesListQuery,
  FlightsListQuery,
  PaginatedResponse,
  PaginationQuery,
  PaymentListItem,
  PointsOfInterestListQuery,
  PropertiesListQuery,
  PropertyAmenitiesListQuery,
  PropertyImagesListQuery,
  BookingsListQuery,
  PaymentsListQuery,
  PromoCodesListQuery,
  PromotionsListQuery,
  RbacAuditLogsListQuery,
  RentalAgenciesListQuery,
  RoomAvailabilityListQuery,
  RoomsListQuery,
  SucceededPaymentsRevenue,
  UsersListQuery,
  VehicleAvailabilityListQuery,
  VehicleCategoriesListQuery,
  VehiclesListQuery,
} from '@africatourismgate/types';
import type { RequestOptions } from './index';

export interface PaginatedRequestClient {
  request<T>(path: string, options?: RequestOptions): Promise<T>;
}

const DEFAULT_CURRENCY = 'CDF';

/** Query keys forwarded as URL search params (beyond page/limit). */
const RESOURCE_QUERY_KEYS = [
  'search',
  'status',
  'organizationId',
  'eventType',
  'actorUserId',
  'userId',
  'dateFrom',
  'dateTo',
  'destinationId',
  'propertyId',
  'roomId',
  'vehicleId',
  'startFrom',
  'endTo',
  'flightClassId',
  'flightId',
  'agencyId',
  'categoryId',
  'destination',
  'checkIn',
  'checkOut',
  'guests',
  'propertyType',
] as const;

export type PaginatedListQuery =
  | PaginationQuery
  | UsersListQuery
  | BookingsListQuery
  | PaymentsListQuery
  | PromoCodesListQuery
  | PromotionsListQuery
  | RbacAuditLogsListQuery
  | DestinationsListQuery
  | PointsOfInterestListQuery
  | PropertiesListQuery
  | PropertyImagesListQuery
  | RoomsListQuery
  | RoomAvailabilityListQuery
  | AmenitiesListQuery
  | PropertyAmenitiesListQuery
  | AirlinesListQuery
  | AirportsListQuery
  | FlightsListQuery
  | FlightClassesListQuery
  | FlightClassAvailabilityListQuery
  | RentalAgenciesListQuery
  | VehicleCategoriesListQuery
  | VehiclesListQuery
  | VehicleAvailabilityListQuery
  | PropertySearchQuery;

function buildQueryString(query?: PaginatedListQuery): string {
  const params = new URLSearchParams();
  if (query?.page !== undefined) {
    params.set('page', String(query.page));
  }
  if (query?.limit !== undefined) {
    params.set('limit', String(query.limit));
  }

  const record = query as Record<string, unknown> | undefined;
  for (const key of RESOURCE_QUERY_KEYS) {
    const value = record?.[key];
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  }

  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export async function fetchPaginated<T>(
  client: PaginatedRequestClient,
  path: string,
  query?: PaginatedListQuery,
  requestOptions?: RequestOptions,
): Promise<PaginatedResponse<T>> {
  return client.request<PaginatedResponse<T>>(
    `${path}${buildQueryString(query)}`,
    requestOptions,
  );
}

export async function fetchTotal(client: PaginatedRequestClient, path: string): Promise<number> {
  const result = await fetchPaginated<unknown>(client, path, { page: 1, limit: 1 });
  return result.meta.total;
}

export async function sumSucceededPaymentsRevenue(
  client: PaginatedRequestClient,
): Promise<SucceededPaymentsRevenue> {
  let page = 1;
  let totalPages = 1;
  let totalCents = 0;
  let currency = DEFAULT_CURRENCY;

  while (page <= totalPages) {
    const result = await fetchPaginated<PaymentListItem>(client, '/payments', {
      page,
      limit: 100,
    });
    totalPages = result.meta.totalPages;

    for (const payment of result.data) {
      if (payment.status !== 'succeeded') {
        continue;
      }
      if (totalCents === 0) {
        currency = payment.currency || DEFAULT_CURRENCY;
      }
      totalCents += payment.amountCents;
    }

    page += 1;
  }

  return { totalCents, currency };
}
