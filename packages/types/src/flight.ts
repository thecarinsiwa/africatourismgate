export type FlightClassName =
  | 'economy'
  | 'premium_economy'
  | 'business'
  | 'first';

export interface Airline {
  id: string;
  iataCode: string;
  name: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateAirlineRequest {
  iataCode: string;
  name: string;
}

export type UpdateAirlineRequest = Partial<CreateAirlineRequest>;

export interface AirlinesListQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface Airport {
  id: string;
  iataCode: string;
  name: string;
  city: string;
  countryCode: string;
  latitude: string | null;
  longitude: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateAirportRequest {
  iataCode: string;
  name: string;
  city: string;
  countryCode: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
}

export type UpdateAirportRequest = Partial<CreateAirportRequest>;

export interface AirportsListQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface Flight {
  id: string;
  airlineId: string;
  flightNumber: string;
  departureAirportId: string;
  arrivalAirportId: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateFlightRequest {
  airlineId: string;
  flightNumber: string;
  departureAirportId: string;
  arrivalAirportId: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
}

export type UpdateFlightRequest = Partial<CreateFlightRequest>;

export interface FlightsListQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface FlightImage {
  id: string;
  flightId: string;
  url: string;
  caption: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateFlightImageRequest {
  flightId: string;
  url: string;
  caption?: string;
  sortOrder?: number;
}

export type UpdateFlightImageRequest = Partial<
  Omit<CreateFlightImageRequest, 'flightId'>
>;

export interface FlightImagesListQuery {
  page?: number;
  limit?: number;
  flightId?: string;
}

export interface FlightClass {
  id: string;
  flightId: string;
  className: FlightClassName;
  basePriceCents: number;
  seatsTotal: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateFlightClassRequest {
  flightId: string;
  className: FlightClassName;
  basePriceCents: number;
  seatsTotal: number;
}

export type UpdateFlightClassRequest = Partial<
  Omit<CreateFlightClassRequest, 'flightId'>
>;

export interface FlightClassesListQuery {
  page?: number;
  limit?: number;
  flightId?: string;
}

export interface FlightClassAvailability {
  id: string;
  flightClassId: string;
  date: string;
  availableSeats: number;
  priceCents: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateFlightClassAvailabilityRequest {
  flightClassId: string;
  date: string;
  availableSeats: number;
  priceCents: number;
}

export type UpdateFlightClassAvailabilityRequest = Partial<
  Pick<CreateFlightClassAvailabilityRequest, 'availableSeats' | 'priceCents'>
>;

export interface FlightClassAvailabilityListQuery {
  flightClassId: string;
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface BulkUpsertFlightClassAvailabilityRequest {
  flightClassId: string;
  dateFrom: string;
  dateTo: string;
  availableSeats: number;
  priceCents: number;
}

export interface BulkUpsertFlightClassAvailabilityResponse {
  flightClassId: string;
  dateFrom: string;
  dateTo: string;
  upsertedCount: number;
  items: FlightClassAvailability[];
}
