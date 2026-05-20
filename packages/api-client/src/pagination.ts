import type {
  DestinationsListQuery,
  PaginatedResponse,
  PaginationQuery,
  PaymentListItem,
  PointsOfInterestListQuery,
  RbacAuditLogsListQuery,
  SucceededPaymentsRevenue,
  UsersListQuery,
} from '@africatourismgate/types';
import type { RequestOptions } from './index';

export interface PaginatedRequestClient {
  request<T>(path: string, options?: RequestOptions): Promise<T>;
}

const DEFAULT_CURRENCY = 'CDF';

function buildQueryString(
  query?:
    | PaginationQuery
    | UsersListQuery
    | RbacAuditLogsListQuery
    | DestinationsListQuery
    | PointsOfInterestListQuery,
): string {
  const params = new URLSearchParams();
  if (query?.page !== undefined) {
    params.set('page', String(query.page));
  }
  if (query?.limit !== undefined) {
    params.set('limit', String(query.limit));
  }
  if ('search' in (query ?? {}) && query && 'search' in query && query.search) {
    params.set('search', query.search);
  }
  if ('status' in (query ?? {}) && query && 'status' in query && query.status) {
    params.set('status', query.status);
  }
  if (
    'organizationId' in (query ?? {}) &&
    query &&
    'organizationId' in query &&
    query.organizationId
  ) {
    params.set('organizationId', query.organizationId);
  }
  if ('eventType' in (query ?? {}) && query && 'eventType' in query && query.eventType) {
    params.set('eventType', query.eventType);
  }
  if (
    'actorUserId' in (query ?? {}) &&
    query &&
    'actorUserId' in query &&
    query.actorUserId
  ) {
    params.set('actorUserId', query.actorUserId);
  }
  if ('dateFrom' in (query ?? {}) && query && 'dateFrom' in query && query.dateFrom) {
    params.set('dateFrom', query.dateFrom);
  }
  if ('dateTo' in (query ?? {}) && query && 'dateTo' in query && query.dateTo) {
    params.set('dateTo', query.dateTo);
  }
  if (
    'destinationId' in (query ?? {}) &&
    query &&
    'destinationId' in query &&
    query.destinationId
  ) {
    params.set('destinationId', query.destinationId);
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export async function fetchPaginated<T>(
  client: PaginatedRequestClient,
  path: string,
  query?:
    | PaginationQuery
    | UsersListQuery
    | RbacAuditLogsListQuery
    | DestinationsListQuery
    | PointsOfInterestListQuery,
): Promise<PaginatedResponse<T>> {
  return client.request<PaginatedResponse<T>>(`${path}${buildQueryString(query)}`);
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
