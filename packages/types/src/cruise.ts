export interface CruiseLine {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateCruiseLineRequest {
  name: string;
}

export type UpdateCruiseLineRequest = Partial<CreateCruiseLineRequest>;

export interface CruiseLinesListQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CruisePort {
  id: string;
  code: string;
  name: string;
  countryCode: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateCruisePortRequest {
  code: string;
  name: string;
  countryCode: string;
}

export type UpdateCruisePortRequest = Partial<CreateCruisePortRequest>;

export interface CruisePortsListQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface Ship {
  id: string;
  cruiseLineId: string;
  name: string;
  builtYear: number | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateShipRequest {
  cruiseLineId: string;
  name: string;
  builtYear?: number | null;
}

export type UpdateShipRequest = Partial<CreateShipRequest>;

export interface ShipsListQuery {
  page?: number;
  limit?: number;
  search?: string;
  cruiseLineId?: string;
}

export interface Itinerary {
  id: string;
  shipId: string;
  name: string;
  durationNights: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateItineraryRequest {
  shipId: string;
  name: string;
  durationNights: number;
}

export type UpdateItineraryRequest = Partial<
  Omit<CreateItineraryRequest, 'shipId'>
>;

export interface ItinerariesListQuery {
  page?: number;
  limit?: number;
  shipId?: string;
}

export interface ItineraryPort {
  id: string;
  itineraryId: string;
  portId: string;
  dayNumber: number;
  arrivalTime: string | null;
  departureTime: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateItineraryPortRequest {
  itineraryId: string;
  portId: string;
  dayNumber: number;
  arrivalTime?: string | null;
  departureTime?: string | null;
}

export type UpdateItineraryPortRequest = Partial<
  Omit<CreateItineraryPortRequest, 'itineraryId'>
>;

export interface ItineraryPortsListQuery {
  page?: number;
  limit?: number;
  itineraryId?: string;
}

export interface Cabin {
  id: string;
  shipId: string;
  categoryName: string;
  maxGuests: number;
  basePriceCents: number;
  currency: string;
  /** NULL = catalogue partagé (toutes orgs). */
  organizationId: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateCabinRequest {
  shipId: string;
  categoryName: string;
  maxGuests: number;
  basePriceCents: number;
  currency: string;
  organizationId?: string | null;
}

export type UpdateCabinRequest = Partial<Omit<CreateCabinRequest, 'shipId'>>;

export interface CabinsListQuery {
  page?: number;
  limit?: number;
  shipId?: string;
  organizationId?: string;
}

export interface CruiseSailing {
  id: string;
  itineraryId: string;
  departureDate: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateCruiseSailingRequest {
  itineraryId: string;
  departureDate: string;
}

export type UpdateCruiseSailingRequest = Partial<CreateCruiseSailingRequest>;

export interface CruiseSailingsListQuery {
  page?: number;
  limit?: number;
  itineraryId?: string;
}

export interface CabinAvailability {
  id: string;
  cabinId: string;
  sailingId: string;
  availableCount: number;
  priceCents: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateCabinAvailabilityRequest {
  cabinId: string;
  sailingId: string;
  availableCount: number;
  priceCents: number;
}

export type UpdateCabinAvailabilityRequest = Partial<
  Pick<CreateCabinAvailabilityRequest, 'availableCount' | 'priceCents'>
>;

export interface CabinAvailabilityListQuery {
  sailingId: string;
  cabinId?: string;
  page?: number;
  limit?: number;
}

export interface ShipImage {
  id: string;
  shipId: string;
  url: string;
  caption: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateShipImageRequest {
  shipId: string;
  url: string;
  caption?: string;
  sortOrder?: number;
}

export type UpdateShipImageRequest = Partial<
  Omit<CreateShipImageRequest, 'shipId'>
>;

export interface ShipImagesListQuery {
  page?: number;
  limit?: number;
  shipId?: string;
}
