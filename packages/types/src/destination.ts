export interface Destination {
  id: string;
  name: string;
  slug: string;
  countryCode: string;
  description: string | null;
  imageUrl: string | null;
  latitude: string | null;
  longitude: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateDestinationRequest {
  name: string;
  slug: string;
  countryCode: string;
  description?: string;
  imageUrl?: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
}

export type UpdateDestinationRequest = Partial<CreateDestinationRequest>;

export interface DestinationsListQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PointOfInterest {
  id: string;
  destinationId: string;
  name: string;
  latitude: string | null;
  longitude: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreatePointOfInterestRequest {
  destinationId: string;
  name: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
}

export type UpdatePointOfInterestRequest = Partial<
  Omit<CreatePointOfInterestRequest, 'destinationId'>
>;

export interface PointsOfInterestListQuery {
  page?: number;
  limit?: number;
  destinationId?: string;
}
