import type {
  PaginatedResponse,
  PropertyDetail,
  PropertyDetailQuery,
  PropertyReviewsListQuery,
  PropertySearchQuery,
  PropertySearchResult,
  PublicDestination,
  Review,
} from '@africatourismgate/types';
import type {
  FlightDetail,
  FlightDetailQuery,
  FlightSearchQuery,
  FlightSearchResult,
} from '../flights/types';

export type {
  FlightDetail,
  FlightDetailAirport,
  FlightDetailClass,
  FlightDetailQuery,
  FlightSearchQuery,
  FlightSearchResult,
} from '../flights/types';

const defaultApiUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://app-africatourismgate.org/api'
    : 'http://localhost:3000/api';

const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? defaultApiUrl).replace(
  /\/$/,
  '',
);

async function fetchPublic<T>(path: string): Promise<T> {
  const res = await fetch(`${apiUrl}${path}`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${path}`);
  }
  return res.json() as Promise<T>;
}

function buildSearchQuery(params: PropertySearchQuery): string {
  const qs = new URLSearchParams();
  if (params.destination) qs.set('destination', params.destination);
  if (params.destinationId) qs.set('destinationId', params.destinationId);
  if (params.checkIn) qs.set('checkIn', params.checkIn);
  if (params.checkOut) qs.set('checkOut', params.checkOut);
  if (params.guests !== undefined) qs.set('guests', String(params.guests));
  if (params.propertyType) qs.set('propertyType', params.propertyType);
  if (params.page !== undefined) qs.set('page', String(params.page));
  if (params.limit !== undefined) qs.set('limit', String(params.limit));
  const s = qs.toString();
  return s ? `?${s}` : '';
}

export async function listPublicDestinations(): Promise<PublicDestination[]> {
  return fetchPublic<PublicDestination[]>('/public/destinations');
}

export async function searchAccommodations(
  params: PropertySearchQuery,
): Promise<PaginatedResponse<PropertySearchResult>> {
  return fetchPublic<PaginatedResponse<PropertySearchResult>>(
    `/public/accommodations/search${buildSearchQuery(params)}`,
  );
}

function buildDetailQuery(params: PropertyDetailQuery): string {
  const qs = new URLSearchParams();
  if (params.checkIn) qs.set('checkIn', params.checkIn);
  if (params.checkOut) qs.set('checkOut', params.checkOut);
  if (params.guests !== undefined) qs.set('guests', String(params.guests));
  if (params.month) qs.set('month', params.month);
  const s = qs.toString();
  return s ? `?${s}` : '';
}

export async function getAccommodationDetail(
  id: string,
  params: PropertyDetailQuery = {},
): Promise<PropertyDetail> {
  return fetchPublic<PropertyDetail>(
    `/public/accommodations/${encodeURIComponent(id)}${buildDetailQuery(params)}`,
  );
}

function buildReviewsQuery(params: PropertyReviewsListQuery): string {
  const qs = new URLSearchParams();
  if (params.page !== undefined) qs.set('page', String(params.page));
  if (params.limit !== undefined) qs.set('limit', String(params.limit));
  const s = qs.toString();
  return s ? `?${s}` : '';
}

export async function getPropertyReviews(
  propertyId: string,
  params: PropertyReviewsListQuery = {},
): Promise<PaginatedResponse<Review>> {
  return fetchPublic<PaginatedResponse<Review>>(
    `/public/accommodations/${encodeURIComponent(propertyId)}/reviews${buildReviewsQuery(params)}`,
  );
}

function buildFlightSearchQuery(params: FlightSearchQuery): string {
  const qs = new URLSearchParams();
  qs.set('from', params.from);
  qs.set('to', params.to);
  qs.set('departureDate', params.departureDate);
  if (params.returnDate) qs.set('returnDate', params.returnDate);
  if (params.passengers !== undefined) qs.set('passengers', String(params.passengers));
  if (params.page !== undefined) qs.set('page', String(params.page));
  if (params.limit !== undefined) qs.set('limit', String(params.limit));
  const s = qs.toString();
  return s ? `?${s}` : '';
}

export async function searchFlights(
  params: FlightSearchQuery,
): Promise<PaginatedResponse<FlightSearchResult>> {
  return fetchPublic<PaginatedResponse<FlightSearchResult>>(
    `/public/flights/search${buildFlightSearchQuery(params)}`,
  );
}

function buildFlightDetailQuery(params: FlightDetailQuery): string {
  const qs = new URLSearchParams();
  qs.set('departureDate', params.departureDate);
  if (params.returnDate) qs.set('returnDate', params.returnDate);
  if (params.passengers !== undefined) qs.set('passengers', String(params.passengers));
  const s = qs.toString();
  return s ? `?${s}` : '';
}

export async function getFlightDetail(
  id: string,
  params: FlightDetailQuery,
): Promise<FlightDetail> {
  return fetchPublic<FlightDetail>(
    `/public/flights/${encodeURIComponent(id)}${buildFlightDetailQuery(params)}`,
  );
}
