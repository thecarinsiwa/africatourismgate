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

export interface RoomAvailability {
  id: string;
  roomId: string;
  date: string;
  availableUnits: number;
  priceCents: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateRoomAvailabilityRequest {
  roomId: string;
  date: string;
  availableUnits: number;
  priceCents: number;
}

export type UpdateRoomAvailabilityRequest = Partial<
  Pick<CreateRoomAvailabilityRequest, 'availableUnits' | 'priceCents'>
>;

export interface RoomAvailabilityListQuery {
  roomId: string;
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface BulkUpsertRoomAvailabilityRequest {
  roomId: string;
  dateFrom: string;
  dateTo: string;
  availableUnits: number;
  priceCents: number;
}

export interface BulkUpsertRoomAvailabilityResponse {
  roomId: string;
  dateFrom: string;
  dateTo: string;
  upsertedCount: number;
  items: RoomAvailability[];
}

export interface PropertySearchQuery {
  destination?: string;
  destinationId?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  propertyType?: PropertyType;
  page?: number;
  limit?: number;
}

export interface PropertySearchResult {
  id: string;
  slug: string;
  name: string;
  propertyType: PropertyType;
  starRating: number | null;
  destinationName: string;
  countryCode: string;
  addressLine: string | null;
  imageUrl: string | null;
  minPriceCents: number;
  currency: string;
  amenityCodes: string[];
}

export interface PublicDestination {
  id: string;
  name: string;
  countryCode: string;
}

export interface PropertyDetailQuery {
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  month?: string;
}

export interface PropertyDetailImage {
  id: string;
  url: string;
  caption: string | null;
  sortOrder: number;
}

export interface PropertyDetailAmenity {
  code: string;
  name: string;
}

export interface PropertyDetailNightlyPrice {
  date: string;
  priceCents: number;
}

export interface PropertyDetailRoom {
  id: string;
  name: string;
  roomType: string | null;
  maxGuests: number;
  bedConfig: string | null;
  basePriceCents: number;
  currency: string;
  totalPriceCents: number | null;
  available: boolean;
  nightlyBreakdown: PropertyDetailNightlyPrice[];
}

export interface PropertyDetailStay {
  checkIn: string | null;
  checkOut: string | null;
  nights: number;
  guests: number;
  minTotalCents: number | null;
  currency: string;
}

export interface PropertyCalendarDay {
  date: string;
  minPriceCents: number;
  available: boolean;
  currency: string;
}

export interface PropertyDetail {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  propertyType: PropertyType;
  starRating: number | null;
  destinationName: string;
  countryCode: string;
  addressLine: string | null;
  images: PropertyDetailImage[];
  amenities: PropertyDetailAmenity[];
  rooms: PropertyDetailRoom[];
  stay: PropertyDetailStay;
  calendarDays: PropertyCalendarDay[];
}
