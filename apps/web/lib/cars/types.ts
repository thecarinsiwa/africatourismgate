export interface VehicleSearchQuery {
  pickupLocation?: string;
  pickupDate?: string;
  returnDate?: string;
  page?: number;
  limit?: number;
}

export interface VehicleSearchResult {
  id: string;
  licensePlate: string | null;
  categoryName: string;
  exampleModel: string | null;
  agencyName: string;
  agencyAddress: string | null;
  pickupCity: string;
  dailyPriceCents: number;
  totalPriceCents: number;
  currency: string;
  rentalDays: number;
  pickupDate: string;
  returnDate: string;
  availabilitySlotId: string;
}

export interface VehicleDetailQuery {
  pickupDate: string;
  returnDate: string;
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

export interface VehicleDetail {
  id: string;
  licensePlate: string | null;
  agency: VehicleDetailAgency;
  category: VehicleDetailCategory;
  pickupDate: string;
  returnDate: string;
  rentalDays: number;
  dailyPriceCents: number;
  totalPriceCents: number;
  currency: string;
  availabilitySlot: VehicleDetailAvailabilitySlot | null;
}
