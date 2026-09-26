/**
 * Types partagés Comptabilité SYSCOHADA (Admin + API).
 * Alignés sur docs/syscohada-domain-model.md (SYSCO-001…003).
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

export const ACCOUNTING_JOURNAL_TYPES = [
  'cash',
  'bank',
  'purchases',
  'sales',
  'general',
  'other',
] as const;
export type AccountingJournalType = (typeof ACCOUNTING_JOURNAL_TYPES)[number];

export const JOURNAL_ENTRY_STATUSES = [
  'draft',
  'posted',
  'reversed',
] as const;
export type JournalEntryStatus = (typeof JOURNAL_ENTRY_STATUSES)[number];

export const JOURNAL_ENTRY_SOURCES = [
  'treasury_mapping',
  'manual',
  'closing',
  'reversal',
] as const;
export type JournalEntrySource = (typeof JOURNAL_ENTRY_SOURCES)[number];

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

// ─── Journals / entries / lines (SYSCO-003) ─────────────────────────────────

export interface AccountingJournal {
  id: string;
  organizationId: string;
  code: string;
  label: string;
  journalType: AccountingJournalType;
  defaultAccountId: string | null;
  nextEntrySeq: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface AccountingJournalsListQuery {
  page?: number;
  limit?: number;
  organizationId?: string;
  journalType?: AccountingJournalType;
  isActive?: boolean;
}

export interface JournalLine {
  id: string;
  journalEntryId: string;
  organizationId: string;
  lineNo: number;
  accountId: string;
  label: string | null;
  debitCents: number;
  creditCents: number;
  originalAmountCents: number | null;
  originalCurrency: string | null;
  fxRate: string | null;
  analyticRefType: string | null;
  analyticRefId: string | null;
  createdAt: string;
  updatedAt: string | null;
  /** Enrichissement optionnel liste grand livre */
  accountCode?: string;
  accountLabel?: string;
  entryNumber?: string;
  entryDate?: string;
  journalId?: string;
  journalCode?: string;
}

export interface JournalEntry {
  id: string;
  organizationId: string;
  journalId: string;
  exerciseId: string;
  periodId: string;
  entryNumber: string;
  entrySeq: number;
  entryDate: string;
  description: string;
  status: JournalEntryStatus;
  source: JournalEntrySource;
  reversesEntryId: string | null;
  postedAt: string | null;
  postedByUserId: string | null;
  currency: string;
  createdAt: string;
  updatedAt: string | null;
  lines?: JournalLine[];
  totalDebitCents?: number;
  totalCreditCents?: number;
}

export interface CreateJournalLineRequest {
  accountId: string;
  label?: string | null;
  debitCents: number;
  creditCents: number;
  originalAmountCents?: number | null;
  originalCurrency?: string | null;
  fxRate?: number | null;
  analyticRefType?: string | null;
  analyticRefId?: string | null;
}

export interface CreateJournalEntryRequest {
  organizationId: string;
  journalId: string;
  /** Requis si `periodId` absent */
  exerciseId?: string;
  /** Si fourni, l’exercice est dérivé de la période */
  periodId?: string;
  entryDate: string;
  description: string;
  status?: 'draft' | 'posted';
  source?: JournalEntrySource;
  reversesEntryId?: string | null;
  lines: CreateJournalLineRequest[];
}

export interface JournalEntriesListQuery {
  page?: number;
  limit?: number;
  organizationId?: string;
  journalId?: string;
  exerciseId?: string;
  periodId?: string;
  status?: JournalEntryStatus;
  accountId?: string;
  includeLines?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface JournalLinesListQuery {
  page?: number;
  limit?: number;
  organizationId?: string;
  accountId?: string;
  journalId?: string;
  exerciseId?: string;
  periodId?: string;
  /** Uniquement lignes d’écritures postées (défaut true pour grand livre) */
  postedOnly?: boolean;
  dateFrom?: string;
  dateTo?: string;
}
