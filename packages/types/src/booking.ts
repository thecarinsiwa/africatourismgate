export type BookingStatus =
  | 'draft'
  | 'pending_payment'
  | 'confirmed'
  | 'cancelled'
  | 'refunded';

export type BookingCheckoutItemType =
  | 'room'
  | 'flight_class'
  | 'vehicle'
  | 'cabin'
  | 'activity_schedule';

export interface Booking {
  id: string;
  userId: string;
  status: BookingStatus;
  totalCents: number;
  currency: string;
  promoCodeId: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface BookingCheckoutItem {
  itemType: BookingCheckoutItemType;
  referenceId: string;
  quantity: number;
  startDate?: string;
  endDate?: string;
  date?: string;
}

export interface BookingCheckoutRequest {
  items: BookingCheckoutItem[];
  currency?: string;
}

export interface BookingCheckoutLine {
  itemType: BookingCheckoutItemType;
  referenceId: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
  titleSnapshot: string;
  currency: string;
  startDate: string | null;
  endDate: string | null;
}

export interface BookingCheckoutPreview {
  lines: BookingCheckoutLine[];
  totalCents: number;
  currency: string;
}

export interface BookingItem {
  id: string;
  bookingId: string;
  itemType: string;
  referenceId: string;
  titleSnapshot: string;
  quantity: number;
  unitPriceCents: number;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface BookingDetail {
  booking: Booking;
  items: BookingItem[];
  totalCents: number;
  currency: string;
}

export interface BookingsListQuery {
  page?: number;
  limit?: number;
  status?: BookingStatus;
  userId?: string;
}
