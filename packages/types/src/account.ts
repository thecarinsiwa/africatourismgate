import type { PaginationQuery } from './pagination.js';

export interface UserAddress {
  id: string;
  userId: string;
  label: string | null;
  line1: string;
  line2: string | null;
  city: string;
  region: string | null;
  postalCode: string | null;
  countryCode: string;
  isDefault: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateUserAddressRequest {
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  region?: string;
  postalCode?: string;
  countryCode: string;
  isDefault?: boolean;
}

export type UpdateUserAddressRequest = Partial<CreateUserAddressRequest>;

export type UserPaymentMethodType = 'card' | 'paypal' | 'other';

export interface UserPaymentMethod {
  id: string;
  userId: string;
  type: UserPaymentMethodType;
  provider: string | null;
  lastFour: string | null;
  /** Never returned by the API (write-only). */
  externalToken?: string | null;
  isDefault: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateUserPaymentMethodRequest {
  type: UserPaymentMethodType;
  provider?: string;
  lastFour?: string;
  externalToken?: string;
  isDefault?: boolean;
}

export type UpdateUserPaymentMethodRequest = Partial<CreateUserPaymentMethodRequest>;

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  preferredLanguage?: string | null;
}

export type LoyaltyTier = 'member' | 'silver' | 'gold' | 'platinum';

export interface LoyaltyAccount {
  id: string;
  userId: string;
  programCode: string;
  pointsBalance: number;
  tier: LoyaltyTier;
  createdAt: string;
  updatedAt: string | null;
}

export interface UserAddressesListQuery extends PaginationQuery {
  userId?: string;
}

export interface UserPaymentMethodsListQuery extends PaginationQuery {
  userId?: string;
}

export interface UserSession {
  id: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface UserSessionsListQuery extends PaginationQuery {
  userId?: string;
}

export type LoyaltyAccountsListQuery = PaginationQuery;

export interface AdminLoyaltyAccountListItem extends LoyaltyAccount {
  userEmail: string;
  userFirstName: string;
  userLastName: string;
  lastActivityAt: string;
}

export interface AdjustLoyaltyPointsRequest {
  delta: number;
  reason?: string;
}

export type AdjustLoyaltyPointsResponse = AdminLoyaltyAccountListItem;
