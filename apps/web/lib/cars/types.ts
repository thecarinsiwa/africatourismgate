import type { ProductGalleryImage } from '../shared/product-images';

export interface VehicleSearchQuery {
  departureLocation?: string;
  arrivalLocation?: string;
  /** @deprecated Prefer departureLocation */
  pickupLocation?: string;
  travelDate?: string;
  /** @deprecated Prefer travelDate */
  pickupDate?: string;
  /** @deprecated Ignored for tronçon pricing */
  returnDate?: string;
  page?: number;
  limit?: number;
}

export interface VehicleSearchResult {
  id: string;
  routeId: string;
  licensePlate: string | null;
  categoryName: string;
  exampleModel: string | null;
  agencyName: string;
  agencyAddress: string | null;
  departureCity: string;
  arrivalCity: string;
  priceCents: number;
  totalPriceCents: number;
  currency: string;
  travelDate: string;
  availabilitySlotId: string;
  imageUrl?: string | null;
  /** @deprecated Use departureCity */
  pickupCity?: string;
  /** @deprecated Use priceCents */
  dailyPriceCents?: number;
  /** @deprecated Always 1 */
  rentalDays?: number;
  /** @deprecated Use travelDate */
  pickupDate?: string;
  /** @deprecated Use travelDate */
  returnDate?: string;
}

export interface VehicleDetailQuery {
  routeId?: string;
  departureDestinationId?: string;
  arrivalDestinationId?: string;
  travelDate?: string;
  /** @deprecated Prefer travelDate */
  pickupDate?: string;
  /** @deprecated Ignored for tronçon pricing */
  returnDate?: string;
}

export interface VehicleDetailAgency {
  id: string;
  name: string;
  address: string | null;
  city: string;
}

export interface VehicleDetailCategory {
  id: string;
  name: string;
  exampleModel: string | null;
}

export interface VehicleDetailAvailabilitySlot {
  id: string;
  startDatetime: string;
  endDatetime: string;
}

export interface VehicleDetailRoute {
  id: string;
  departureDestinationId: string;
  departureCity: string;
  arrivalDestinationId: string;
  arrivalCity: string;
  priceCents: number;
  currency: string;
}

export interface VehicleDetail {
  id: string;
  licensePlate: string | null;
  agency: VehicleDetailAgency;
  category: VehicleDetailCategory;
  route: VehicleDetailRoute;
  travelDate: string;
  priceCents: number;
  totalPriceCents: number;
  currency: string;
  availabilitySlot: VehicleDetailAvailabilitySlot | null;
  images?: ProductGalleryImage[];
  /** Première photo — dérivée de `images` côté API. */
  imageUrl?: string | null;
  /** @deprecated Use travelDate */
  pickupDate?: string;
  /** @deprecated Use travelDate */
  returnDate?: string;
  /** @deprecated Always 1 */
  rentalDays?: number;
  /** @deprecated Use priceCents */
  dailyPriceCents?: number;
}
