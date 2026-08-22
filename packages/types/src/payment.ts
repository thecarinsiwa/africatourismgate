import type { BookingStatus } from './booking.js';
import type { PaymentStatus } from './pagination.js';

export interface PaymentsListQuery {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
  organizationId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface PaymentListItem {
  id: string;
  bookingId: string;
  amountCents: number;
  currency: string;
  status: PaymentStatus;
  provider: string | null;
  createdAt: string;
  clientEmail: string;
  clientFirstName: string;
  clientLastName: string;
  organizationId: string | null;
}

export interface PaymentAdminDetail {
  id: string;
  bookingId: string;
  amountCents: number;
  currency: string;
  status: PaymentStatus;
  provider: string | null;
  externalId: string | null;
  createdAt: string;
  updatedAt: string | null;
  bookingStatus: BookingStatus;
  clientEmail: string;
  clientFirstName: string;
  clientLastName: string;
  organizationId: string | null;
}

export interface RefundPaymentRequest {
  amountCents?: number;
}
