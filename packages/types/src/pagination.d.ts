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
    search?: string;
}
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';
export interface SucceededPaymentsRevenue {
    totalCents: number;
    currency: string;
}
