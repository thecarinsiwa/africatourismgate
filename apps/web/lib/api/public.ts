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
  VehicleDetail,
  VehicleDetailQuery,
  VehicleSearchQuery,
  VehicleSearchResult,
} from '../cars/types';
import type {
  ActivityBrowseQuery,
  ActivityDetail,
  ActivityDetailQuery,
  ActivitySearchQuery,
  ActivitySearchResult,
} from '../activities/types';
import type {
  CruiseSailingDetail,
  CruiseSailingDetailQuery,
  CruiseSearchQuery,
  CruiseSearchResult,
} from '../cruises/types';
import type {
  FlightDetail,
  FlightDetailQuery,
  FlightSearchQuery,
  FlightSearchResult,
  PublicAirport,
} from '../flights/types';

export type {
  VehicleDetail,
  VehicleDetailAgency,
  VehicleDetailAvailabilitySlot,
  VehicleDetailCategory,
  VehicleDetailQuery,
  VehicleSearchQuery,
  VehicleSearchResult,
} from '../cars/types';

export type {
  FlightDetail,
  FlightDetailAirport,
  FlightDetailClass,
  FlightDetailQuery,
  FlightSearchQuery,
  FlightSearchResult,
  PublicAirport,
} from '../flights/types';

export type {
  ActivityBrowseQuery,
  ActivityDetail,
  ActivityDetailQuery,
  ActivityScheduleOffer,
  ActivitySearchQuery,
  ActivitySearchResult,
} from '../activities/types';

export type {
  CruiseCabinOffer,
  CruiseItineraryPort,
  CruiseSailingDetail,
  CruiseSailingDetailQuery,
  CruiseSearchQuery,
  CruiseSearchResult,
} from '../cruises/types';

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

export async function listVehiclePickupLocations(): Promise<PublicDestination[]> {
  return fetchPublic<PublicDestination[]>('/public/vehicles/pickup-locations');
}

export async function listActivityDestinations(): Promise<PublicDestination[]> {
  return fetchPublic<PublicDestination[]>('/public/activities/destinations');
}

export async function listPublicAirports(): Promise<PublicAirport[]> {
  return fetchPublic<PublicAirport[]>('/public/airports');
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
  if (params.from) qs.set('from', params.from);
  if (params.to) qs.set('to', params.to);
  if (params.departureDate) qs.set('departureDate', params.departureDate);
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

function buildVehicleSearchQuery(params: VehicleSearchQuery): string {
  const qs = new URLSearchParams();
  if (params.pickupLocation) qs.set('pickupLocation', params.pickupLocation);
  if (params.pickupDate) qs.set('pickupDate', params.pickupDate);
  if (params.returnDate) qs.set('returnDate', params.returnDate);
  if (params.page !== undefined) qs.set('page', String(params.page));
  if (params.limit !== undefined) qs.set('limit', String(params.limit));
  const s = qs.toString();
  return s ? `?${s}` : '';
}

export async function searchVehicles(
  params: VehicleSearchQuery,
): Promise<PaginatedResponse<VehicleSearchResult>> {
  return fetchPublic<PaginatedResponse<VehicleSearchResult>>(
    `/public/vehicles/search${buildVehicleSearchQuery(params)}`,
  );
}

function buildVehicleDetailQuery(params: VehicleDetailQuery): string {
  const qs = new URLSearchParams();
  qs.set('pickupDate', params.pickupDate);
  qs.set('returnDate', params.returnDate);
  const s = qs.toString();
  return s ? `?${s}` : '';
}

export async function getVehicleDetail(
  id: string,
  params: VehicleDetailQuery,
): Promise<VehicleDetail> {
  return fetchPublic<VehicleDetail>(
    `/public/vehicles/${encodeURIComponent(id)}${buildVehicleDetailQuery(params)}`,
  );
}

function buildCruiseSearchQuery(params: CruiseSearchQuery): string {
  const qs = new URLSearchParams();
  if (params.sailFrom) qs.set('sailFrom', params.sailFrom);
  if (params.sailTo) qs.set('sailTo', params.sailTo);
  if (params.startDate) qs.set('startDate', params.startDate);
  if (params.endDate) qs.set('endDate', params.endDate);
  if (params.guests !== undefined) qs.set('guests', String(params.guests));
  if (params.page !== undefined) qs.set('page', String(params.page));
  if (params.limit !== undefined) qs.set('limit', String(params.limit));
  const s = qs.toString();
  return s ? `?${s}` : '';
}

export async function searchCruises(
  params: CruiseSearchQuery,
): Promise<PaginatedResponse<CruiseSearchResult>> {
  return fetchPublic<PaginatedResponse<CruiseSearchResult>>(
    `/public/cruises/search${buildCruiseSearchQuery(params)}`,
  );
}

function buildCruiseSailingDetailQuery(params: CruiseSailingDetailQuery): string {
  const qs = new URLSearchParams();
  if (params.guests !== undefined) qs.set('guests', String(params.guests));
  const s = qs.toString();
  return s ? `?${s}` : '';
}

export async function getCruiseSailingDetail(
  id: string,
  params: CruiseSailingDetailQuery = {},
): Promise<CruiseSailingDetail> {
  return fetchPublic<CruiseSailingDetail>(
    `/public/cruises/sailings/${encodeURIComponent(id)}${buildCruiseSailingDetailQuery(params)}`,
  );
}

function buildActivitySearchQuery(params: ActivitySearchQuery): string {
  const qs = new URLSearchParams();
  if (params.destination) qs.set('destination', params.destination);
  qs.set('date', params.date);
  if (params.participants !== undefined) qs.set('participants', String(params.participants));
  if (params.page !== undefined) qs.set('page', String(params.page));
  if (params.limit !== undefined) qs.set('limit', String(params.limit));
  const s = qs.toString();
  return s ? `?${s}` : '';
}

export async function browseActivities(
  params: ActivityBrowseQuery,
): Promise<PaginatedResponse<ActivitySearchResult>> {
  const qs = new URLSearchParams();
  if (params.destination) qs.set('destination', params.destination);
  if (params.participants !== undefined) qs.set('participants', String(params.participants));
  if (params.page !== undefined) qs.set('page', String(params.page));
  if (params.limit !== undefined) qs.set('limit', String(params.limit));
  const query = qs.toString();
  return fetchPublic<PaginatedResponse<ActivitySearchResult>>(
    `/public/activities/browse${query ? `?${query}` : ''}`,
  );
}

export async function searchActivities(
  params: ActivitySearchQuery,
): Promise<PaginatedResponse<ActivitySearchResult>> {
  return fetchPublic<PaginatedResponse<ActivitySearchResult>>(
    `/public/activities/search${buildActivitySearchQuery(params)}`,
  );
}

function buildActivityDetailQuery(params: ActivityDetailQuery): string {
  const qs = new URLSearchParams();
  qs.set('date', params.date);
  if (params.participants !== undefined) qs.set('participants', String(params.participants));
  const s = qs.toString();
  return s ? `?${s}` : '';
}

export async function getActivityDetail(
  id: string,
  params: ActivityDetailQuery,
): Promise<ActivityDetail> {
  return fetchPublic<ActivityDetail>(
    `/public/activities/${encodeURIComponent(id)}${buildActivityDetailQuery(params)}`,
  );
}
