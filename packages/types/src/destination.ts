export interface Destination {
  id: string;
  name: string;
  slug: string;
  countryCode: string;
  description: string | null;
  imageUrl: string | null;
  latitude: string | null;
  longitude: string | null;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface PublicDestinationHighlight {
  id: string;
  name: string;
  slug: string;
  countryCode: string;
  description: string | null;
  imageUrl: string | null;
}

export interface CreateDestinationRequest {
  name: string;
  slug: string;
  countryCode: string;
  description?: string;
  imageUrl?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  isFeatured?: boolean;
}

export type UpdateDestinationRequest = Partial<CreateDestinationRequest>;

export interface DestinationsListQuery {
  page?: number;
  limit?: number;
  search?: string;
  isFeatured?: boolean;
}

export interface DestinationRelatedCounts {
  properties: number;
  activities: number;
  packages: number;
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
