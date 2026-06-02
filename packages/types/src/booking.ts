import type { Review } from './review.js';

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
  promotionId?: string | null;
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
  promoCode?: string;
  promotionId?: string;
  /** Staff only (e.g. POS): booking is owned by this user instead of the actor. */
  customerUserId?: string;
}

export interface AppliedCheckoutDiscount {
  kind: 'promo_code' | 'promotion';
  id: string;
  label: string;
  discountType: 'percent' | 'fixed_amount';
  discountValue: number;
  discountCents: number;
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
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  currency: string;
  appliedDiscount: AppliedCheckoutDiscount | null;
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
  review?: Review | null;
  canReview?: boolean;
}

export interface BookingClient {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string | null;
  organizationName: string | null;
}

export interface BookingPayment {
  id: string;
  bookingId: string;
  amountCents: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  provider: string | null;
  externalId: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface BookingStatusHistoryEntry {
  id: string;
  bookingId: string;
  fromStatus: BookingStatus | null;
  toStatus: BookingStatus;
  reason: string | null;
  changedByUserId: string | null;
  createdAt: string;
}

export interface BookingAdminDetail extends BookingDetail {
  client: BookingClient;
  payments: BookingPayment[];
  statusHistory: BookingStatusHistoryEntry[];
}

export interface UpdateBookingStatusRequest {
  status: BookingStatus;
  reason?: string;
}

export interface CancelBookingRequest {
  reason?: string;
}

export interface RecordCashPaymentRequest {
  note?: string;
}

export interface BookingPaymentIntentResponse {
  paymentId: string;
  paymentIntentId: string;
  clientSecret: string;
  amountCents: number;
  currency: string;
}

export interface BookingCheckoutSessionResponse {
  paymentId: string;
  sessionId: string;
  url: string;
  amountCents: number;
  currency: string;
}

export interface RefundPaymentResponse {
  refundId: string;
  amountCents: number;
  stripeStatus: string;
  paymentId: string;
  bookingId: string;
  paymentStatus: BookingPayment['status'];
  bookingStatus: BookingStatus;
}

export interface BookingListItem extends Booking {
  clientEmail: string;
  clientFirstName: string;
  clientLastName: string;
  organizationId: string | null;
}

export interface BookingsListQuery {
  page?: number;
  limit?: number;
  status?: BookingStatus;
  userId?: string;
  organizationId?: string;
  dateFrom?: string;
  dateTo?: string;
}
