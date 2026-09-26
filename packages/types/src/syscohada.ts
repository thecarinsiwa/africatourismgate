/**
 * Types partagés Comptabilité SYSCOHADA (Admin + API).
 * Alignés sur docs/syscohada-domain-model.md (SYSCO-001 / SYSCO-002).
 */

// ─── Enums / constantes ─────────────────────────────────────────────────────

export const CHART_ACCOUNT_TYPES = [
  'equity',
  'fixed_asset',
  'inventory',
  'third_party',
  'treasury',
  'expense',
  'revenue',
  'special',
] as const;
export type ChartAccountType = (typeof CHART_ACCOUNT_TYPES)[number];

export const ACCOUNTING_EXERCISE_STATUSES = [
  'open',
  'closing',
  'closed',
] as const;
export type AccountingExerciseStatus =
  (typeof ACCOUNTING_EXERCISE_STATUSES)[number];

export const ACCOUNTING_PERIOD_STATUSES = [
  'open',
  'locked',
  'closed',
] as const;
export type AccountingPeriodStatus =
  (typeof ACCOUNTING_PERIOD_STATUSES)[number];

// ─── Chart of accounts ──────────────────────────────────────────────────────

export interface ChartAccount {
  id: string;
  organizationId: string;
  code: string;
  label: string;
  classNumber: number;
  accountType: ChartAccountType;
  parentId: string | null;
  isPostable: boolean;
  isActive: boolean;
  syscohadaRef: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface ChartAccountsListQuery {
  page?: number;
  limit?: number;
  organizationId?: string;
  classNumber?: number;
  accountType?: ChartAccountType;
  isActive?: boolean;
  isPostable?: boolean;
  search?: string;
}

// ─── Exercises / periods ────────────────────────────────────────────────────

export interface AccountingPeriod {
  id: string;
  exerciseId: string;
  organizationId: string;
  code: string;
  startsOn: string;
  endsOn: string;
  status: AccountingPeriodStatus;
  sequenceNo: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface AccountingExercise {
  id: string;
  organizationId: string;
  code: string;
  label: string;
  startsOn: string;
  endsOn: string;
  currency: string;
  status: AccountingExerciseStatus;
  closedAt: string | null;
  closedByUserId: string | null;
  createdAt: string;
  updatedAt: string | null;
  /** Présent sur GET détail / liste si demandé */
  periods?: AccountingPeriod[];
}

export interface AccountingExercisesListQuery {
  page?: number;
  limit?: number;
  organizationId?: string;
  status?: AccountingExerciseStatus;
  includePeriods?: boolean;
}

export interface AccountingPeriodsListQuery {
  page?: number;
  limit?: number;
  organizationId?: string;
  exerciseId?: string;
  status?: AccountingPeriodStatus;
}
