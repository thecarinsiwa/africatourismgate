export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';

export interface PaymentListItem {
  id: string;
  amountCents: number;
  currency: string;
  status: PaymentStatus;
}

export interface SucceededPaymentsRevenue {
  totalCents: number;
  currency: string;
}
