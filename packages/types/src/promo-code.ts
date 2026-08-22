export type PromoCodeDiscountType = 'percent' | 'fixed_amount';

export interface PromoCode {
  id: string;
  code: string;
  coverImageUrl: string | null;
  discountType: PromoCodeDiscountType;
  /** Decimal string from API (e.g. "20" or "15.50"). */
  discountValue: string;
  validFrom: string;
  validUntil: string;
  maxRedemptions: number | null;
  redemptionCount: number;
  active: number;
  createdAt: string;
  updatedAt: string | null;
}

export type PromoListValidityFilter = 'ongoing' | 'upcoming' | 'expired';

export interface PromoCodesListQuery {
  page?: number;
  limit?: number;
  search?: string;
  active?: boolean;
  validity?: PromoListValidityFilter;
}

export interface CreatePromoCodeRequest {
  code: string;
  coverImageUrl?: string | null;
  discountType: PromoCodeDiscountType;
  discountValue: number;
  validFrom: string;
  validUntil: string;
  maxRedemptions?: number | null;
  active: number;
}

export type UpdatePromoCodeRequest = Partial<CreatePromoCodeRequest>;
