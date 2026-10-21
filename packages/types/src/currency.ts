/**
 * Catalogue global de devises (plateforme).
 * Aligné sur database/migrations/add_platform_currencies.sql.
 */

export interface Currency {
  id: string;
  code: string;
  label: string;
  symbol: string | null;
  decimalPlaces: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface CurrenciesListQuery {
  page?: number;
  limit?: number;
  /** When true, only `isActive` rows (form selects). */
  activeOnly?: boolean;
  search?: string;
}

export interface CreateCurrencyRequest {
  code: string;
  label: string;
  symbol?: string | null;
  decimalPlaces?: number;
  isActive?: boolean;
  sortOrder?: number;
}

export type UpdateCurrencyRequest = Partial<CreateCurrencyRequest>;
