import type { PromoCodeDiscountType } from './promo-code.js';
export interface Promotion {
    id: string;
    name: string;
    description: string | null;
    discountType: PromoCodeDiscountType | null;
    discountValue: string | null;
    validFrom: string | null;
    validUntil: string | null;
    maxRedemptions: number | null;
    redemptionCount: number;
    active: number;
    createdAt: string;
    updatedAt: string | null;
}
export interface PromotionsListQuery {
    page?: number;
    limit?: number;
    search?: string;
}
export interface CreatePromotionRequest {
    name: string;
    description?: string | null;
    discountType?: PromoCodeDiscountType | null;
    discountValue?: number | null;
    validFrom?: string | null;
    validUntil?: string | null;
    maxRedemptions?: number | null;
    active: number;
}
export type UpdatePromotionRequest = Partial<CreatePromotionRequest>;
