export type PropertyType =
  | 'hotel'
  | 'resort'
  | 'apartment'
  | 'villa'
  | 'hostel'
  | 'other';

export interface Property {
  id: string;
  destinationId: string;
  name: string;
  slug: string;
  propertyType: PropertyType;
  starRating: string | null;
  description: string | null;
  addressLine: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreatePropertyRequest {
  destinationId: string;
  name: string;
  slug: string;
  propertyType: PropertyType;
  starRating?: number;
  description?: string;
  addressLine?: string;
}

export type UpdatePropertyRequest = Partial<CreatePropertyRequest>;

export interface PropertiesListQuery {
  page?: number;
  limit?: number;
  search?: string;
  destinationId?: string;
}

export interface PropertyImage {
  id: string;
  propertyId: string;
  url: string;
  caption: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreatePropertyImageRequest {
  propertyId: string;
  url: string;
  caption?: string;
  sortOrder?: number;
}

export type UpdatePropertyImageRequest = Partial<
  Omit<CreatePropertyImageRequest, 'propertyId'>
>;

export interface PropertyImagesListQuery {
  page?: number;
  limit?: number;
  propertyId?: string;
}

export interface Room {
  id: string;
  propertyId: string;
  name: string;
  roomType: string | null;
  maxGuests: number;
  bedConfig: string | null;
  basePriceCents: number;
  currency: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateRoomRequest {
  propertyId: string;
  name: string;
  roomType?: string;
  maxGuests: number;
  bedConfig?: string;
  basePriceCents: number;
  currency: string;
}

export type UpdateRoomRequest = Partial<Omit<CreateRoomRequest, 'propertyId'>>;

export interface RoomsListQuery {
  page?: number;
  limit?: number;
  propertyId?: string;
}

export interface Amenity {
  id: string;
  code: string;
  name: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateAmenityRequest {
  code: string;
  name: string;
}

export type UpdateAmenityRequest = Partial<CreateAmenityRequest>;

export interface AmenitiesListQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PropertyAmenity {
  propertyId: string;
  amenityId: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface PropertyAmenitiesListQuery {
  page?: number;
  limit?: number;
  propertyId?: string;
}

export interface ReplacePropertyAmenitiesRequest {
  propertyId: string;
  amenityIds: string[];
}

export interface PropertyAmenitiesPayload {
  propertyId: string;
  amenityIds: string[];
}
