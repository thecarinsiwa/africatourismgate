export interface MobileMoneyCountry {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface MobileMoneyOperator {
  id: string;
  countryId: string;
  name: string;
  logoUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface MobileMoneyPaymentNumber {
  id: string;
  operatorId: string;
  phoneE164: string;
  label: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string | null;
}

/** Public checkout tree: active countries → operators → numbers. */
export interface PublicMobileMoneyPaymentNumber {
  id: string;
  phoneE164: string;
  label: string | null;
}

export interface PublicMobileMoneyOperator {
  id: string;
  name: string;
  logoUrl: string | null;
  numbers: PublicMobileMoneyPaymentNumber[];
}

export interface PublicMobileMoneyCountry {
  id: string;
  code: string;
  name: string;
  operators: PublicMobileMoneyOperator[];
}

export interface MobileMoneyCountriesListQuery {
  page?: number;
  limit?: number;
  organizationId?: string;
}

export interface MobileMoneyOperatorsListQuery {
  page?: number;
  limit?: number;
  organizationId?: string;
  countryId: string;
}

export interface MobileMoneyPaymentNumbersListQuery {
  page?: number;
  limit?: number;
  organizationId?: string;
  operatorId: string;
}

export interface CreateMobileMoneyCountryRequest {
  organizationId?: string;
  code: string;
  name: string;
  isActive?: boolean;
  sortOrder?: number;
}

export type UpdateMobileMoneyCountryRequest =
  Partial<CreateMobileMoneyCountryRequest>;

export interface CreateMobileMoneyOperatorRequest {
  countryId: string;
  name: string;
  logoUrl?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}

export type UpdateMobileMoneyOperatorRequest = Partial<
  Omit<CreateMobileMoneyOperatorRequest, 'countryId'>
>;

export interface CreateMobileMoneyPaymentNumberRequest {
  operatorId: string;
  phoneE164: string;
  label?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}

export type UpdateMobileMoneyPaymentNumberRequest = Partial<
  Omit<CreateMobileMoneyPaymentNumberRequest, 'operatorId'>
>;
