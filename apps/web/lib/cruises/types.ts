import type { ProductGalleryImage } from '../shared/product-images';

export interface CruiseSearchQuery {
  sailFrom?: string;
  sailTo?: string;
  startDate?: string;
  endDate?: string;
  guests?: number;
  page?: number;
  limit?: number;
}

export interface CruiseSearchResult {
  id: string;
  departureDate: string;
  returnDate: string;
  itineraryName: string;
  shipName: string;
  cruiseLineName: string;
  sailFromPortCode: string;
  sailFromPortName: string;
  sailToPortCode: string;
  sailToPortName: string;
  durationNights: number;
  minPriceCents: number;
  currency: string;
  imageUrl?: string | null;
}

export interface CruiseSailingDetailQuery {
  guests?: number;
}

export interface CruiseItineraryPort {
  dayNumber: number;
  portCode: string;
  portName: string;
  countryCode: string;
  arrivalTime: string | null;
  departureTime: string | null;
}

export interface CruiseCabinOffer {
  availabilityId: string;
  cabinId: string;
  categoryName: string;
  maxGuests: number;
  priceCents: number;
  availableCount: number;
  currency: string;
}

export interface CruiseSailingDetail {
  id: string;
  departureDate: string;
  returnDate: string;
  durationNights: number;
  itineraryName: string;
  shipName: string;
  cruiseLineName: string;
  sailFromPortCode: string;
  sailFromPortName: string;
  sailToPortCode: string;
  sailToPortName: string;
  minPriceCents: number;
  currency: string;
  itineraryPorts: CruiseItineraryPort[];
  cabins: CruiseCabinOffer[];
  images?: ProductGalleryImage[];
}
