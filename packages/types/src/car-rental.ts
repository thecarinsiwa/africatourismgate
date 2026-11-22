export type VehicleAvailabilityStatus = 'available' | 'maintenance' | 'rented';

export interface RentalAgency {
  id: string;
  name: string;
  destinationId: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateRentalAgencyRequest {
  name: string;
  destinationId?: string | null;
  address?: string | null;
}

export type UpdateRentalAgencyRequest = Partial<CreateRentalAgencyRequest>;

export interface RentalAgenciesListQuery {
  page?: number;
  limit?: number;
  search?: string;
  destinationId?: string;
  hasAddress?: boolean;
  hasDestination?: boolean;
}

export interface VehicleCategory {
  id: string;
  name: string;
  exampleModel: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateVehicleCategoryRequest {
  name: string;
  exampleModel?: string | null;
}

export type UpdateVehicleCategoryRequest = Partial<CreateVehicleCategoryRequest>;

export interface VehicleCategoriesListQuery {
  page?: number;
  limit?: number;
  search?: string;
  hasExampleModel?: boolean;
}

export interface Vehicle {
  id: string;
  agencyId: string;
  categoryId: string;
  licensePlate: string | null;
  currency: string;
  /** Max seats for shared trips (/cars). */
  maxPassengers: number;
  /** NULL = catalogue partagé (toutes orgs). */
  organizationId: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateVehicleRequest {
  agencyId: string;
  categoryId: string;
  licensePlate?: string;
  currency: string;
  /** Defaults to 4. */
  maxPassengers?: number;
  organizationId?: string | null;
}

export type UpdateVehicleRequest = Partial<
  Omit<CreateVehicleRequest, 'agencyId' | 'categoryId'>
> & {
  agencyId?: string;
  categoryId?: string;
};

export interface VehiclesListQuery {
  page?: number;
  limit?: number;
  search?: string;
  agencyId?: string;
  categoryId?: string;
  organizationId?: string;
}

export interface VehicleImage {
  id: string;
  vehicleId: string;
  url: string;
  caption: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateVehicleImageRequest {
  vehicleId: string;
  url: string;
  caption?: string;
  sortOrder?: number;
}

export type UpdateVehicleImageRequest = Partial<
  Omit<CreateVehicleImageRequest, 'vehicleId'>
>;

export interface VehicleImagesListQuery {
  page?: number;
  limit?: number;
  vehicleId?: string;
}

export interface VehicleAvailability {
  id: string;
  vehicleId: string;
  startDatetime: string;
  endDatetime: string;
  status: VehicleAvailabilityStatus;
  latitude: string | null;
  longitude: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateVehicleAvailabilityRequest {
  vehicleId: string;
  startDatetime: string;
  endDatetime: string;
  status?: VehicleAvailabilityStatus;
  latitude?: number | string | null;
  longitude?: number | string | null;
}

export type UpdateVehicleAvailabilityRequest = Partial<
  Omit<CreateVehicleAvailabilityRequest, 'vehicleId'>
>;

export interface VehicleAvailabilityListQuery {
  vehicleId: string;
  page?: number;
  limit?: number;
  startFrom?: string;
  endTo?: string;
}

/** Active public catalogue OD pair for the /cars search form. */
export interface VehicleRouteOption {
  departureCity: string;
  arrivalCity: string;
}

/**
 * Per-person price for a passenger-count band on a tronçon.
 * Example: min=2, max=4, priceCents=7000 → 70.00 per person when N∈[2,4].
 */
export interface VehicleRoutePriceTier {
  id: string;
  routeId: string;
  minPassengers: number;
  maxPassengers: number;
  priceCents: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface VehicleRoutePriceTierInput {
  minPassengers: number;
  maxPassengers: number;
  priceCents: number;
}

export interface CreateVehicleRoutePriceTierRequest extends VehicleRoutePriceTierInput {
  routeId: string;
}

export type UpdateVehicleRoutePriceTierRequest = Partial<VehicleRoutePriceTierInput>;

export interface VehicleRoutePriceTiersListQuery {
  page?: number;
  limit?: number;
  routeId?: string;
}

/**
 * Tronçon tarifé : ville départ → ville arrivée (texte libre) pour un véhicule.
 * `active` gates the public /cars catalogue only — inactive routes remain
 * selectable in package products (`item_type: 'troncon'`).
 * `priceCents` remains the legacy / package fallback (often the 1-person tier).
 */
export interface VehicleRoute {
  id: string;
  vehicleId: string;
  departureCity: string;
  arrivalCity: string;
  priceCents: number;
  currency: string;
  /** 1 = visible on /cars; 0 = hidden from /cars (packages still OK). */
  active: number;
  /** Present when the API loads tiers with the route. */
  priceTiers?: VehicleRoutePriceTier[];
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateVehicleRouteRequest {
  vehicleId: string;
  departureCity: string;
  arrivalCity: string;
  priceCents: number;
  currency: string;
  /** Defaults to true (visible on /cars). Packages ignore this flag. */
  active?: boolean;
  /** When omitted on create, a 1–1 tier is seeded from `priceCents`. */
  priceTiers?: VehicleRoutePriceTierInput[];
}

export type UpdateVehicleRouteRequest = Partial<
  Omit<CreateVehicleRouteRequest, 'vehicleId'>
>;

export interface VehicleRoutesListQuery {
  page?: number;
  limit?: number;
  vehicleId?: string;
  departureCity?: string;
  arrivalCity?: string;
  search?: string;
  /** Filter by /cars catalogue visibility. */
  active?: boolean;
  /** When true, each route includes `priceTiers`. */
  includePriceTiers?: boolean;
}

export type VehicleTripStatus =
  | 'open'
  | 'payment_closed'
  | 'completed'
  | 'cancelled';

export interface VehicleTrip {
  id: string;
  vehicleId: string;
  routeId: string;
  availabilityId: string;
  departureDatetime: string;
  createdByUserId: string | null;
  maxCapacity: number;
  seatsReserved: number;
  seatsRemaining: number;
  status: VehicleTripStatus;
  /** Per-person price for current seatsReserved (or preview N). */
  priceCentsPerPerson: number;
  currency: string;
  departureCity: string;
  arrivalCity: string;
  paymentClosesAt: string;
  canJoin: boolean;
  /** True when the authenticated viewer created this trip. */
  isMine: boolean;
  canEditDeparture: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface VehicleTripsListQuery {
  routeId?: string;
  vehicleId?: string;
  /** YYYY-MM-DD — trips departing that calendar day */
  travelDate?: string;
  status?: VehicleTripStatus;
  page?: number;
  limit?: number;
}

export interface CreateVehicleTripRequest {
  vehicleId: string;
  routeId: string;
  /** ISO datetime of departure (set by first booker). */
  departureDatetime: string;
  /** Seats to reserve for the first booker (default 1). */
  seats?: number;
}

export interface JoinVehicleTripRequest {
  seats?: number;
}

export interface UpdateVehicleTripRequest {
  departureDatetime: string;
}
