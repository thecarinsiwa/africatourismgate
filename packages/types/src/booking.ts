export type BookingStatus =
  | 'draft'
  | 'pending_payment'
  | 'confirmed'
  | 'cancelled'
  | 'refunded';

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

export interface BookingCheckoutRoomItem {
  roomId: string;
  startDate: string;
  endDate: string;
  quantity: number;
}

export interface BookingCheckoutRequest {
  items: BookingCheckoutRoomItem[];
  currency?: string;
}

export interface BookingCheckoutLine {
  roomId: string;
  date: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
  titleSnapshot: string;
  currency: string;
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
