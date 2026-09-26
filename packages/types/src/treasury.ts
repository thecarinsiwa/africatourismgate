/**
 * Types partagés Module Trésorerie (Admin + API).
 * Alignés sur docs/tresorerie-domain-model.md et les entités Nest TRESO-002…006.
 */

import type { BookingCheckoutItemType } from './booking.js';

// ─── Enums / constantes (documentés, réutilisables runtime) ─────────────────

/** Origine des fonds (§5.1) */
export const FUND_ENTRY_SOURCES = [
  'booking_payment',
  'customer_direct',
  'partner',
  'grant_donation',
  'owner_capital',
  'bank_interest',
  'other',
] as const;
export type FundEntrySource = (typeof FUND_ENTRY_SOURCES)[number];

/** Mode de paiement trésorerie (§5.2) */
export const TREASURY_PAYMENT_METHODS = [
  'cash',
  'bank_transfer',
  'mobile_money',
  'stripe',
  'cheque',
  'other',
] as const;
export type TreasuryPaymentMethod = (typeof TREASURY_PAYMENT_METHODS)[number];

export const FUND_ENTRY_STATUSES = ['recorded', 'voided'] as const;
export type FundEntryStatus = (typeof FUND_ENTRY_STATUSES)[number];

/** Circuit état de besoin (§5.3 / §6) */
export const EXPENSE_REQUEST_STATUSES = [
  'draft',
  'submitted',
  'validated',
  'authorized',
  'rejected',
  'cancelled',
  'closed',
] as const;
export type ExpenseRequestStatus = (typeof EXPENSE_REQUEST_STATUSES)[number];

export const FUND_EXIT_STATUSES = [
  'draft',
  'disbursed',
  'recorded',
  'voided',
] as const;
export type FundExitStatus = (typeof FUND_EXIT_STATUSES)[number];

export const BUDGET_PERIOD_TYPES = ['monthly', 'annual'] as const;
export type BudgetPeriodType = (typeof BUDGET_PERIOD_TYPES)[number];

export const BUDGET_SCOPE_TYPES = ['general', 'activity', 'product'] as const;
export type BudgetScopeType = (typeof BUDGET_SCOPE_TYPES)[number];

/** Produit / service budgété — aligné booking items */
export type BudgetProductType = BookingCheckoutItemType;

export const BUDGET_PRODUCT_TYPES: readonly BudgetProductType[] = [
  'room',
  'flight_class',
  'vehicle',
  'cabin',
  'activity_schedule',
  'package',
] as const;

export const TREASURY_AUDIT_ENTITY_TYPES = [
  'fund_entry',
  'fund_exit',
  'expense_request',
  'budget',
  'external_collaborator',
  'access_token',
  'accounting_link',
] as const;
export type TreasuryAuditEntityType =
  (typeof TREASURY_AUDIT_ENTITY_TYPES)[number];

export const TREASURY_AUDIT_ACTIONS = [
  'create',
  'update',
  'transition',
  'void',
  'attach',
  'detach',
  'invite',
  'activate',
  'deactivate',
  'revoke_token',
] as const;
export type TreasuryAuditAction = (typeof TREASURY_AUDIT_ACTIONS)[number];

export const TREASURY_ACTOR_TYPES = ['user', 'external', 'system'] as const;
export type TreasuryActorType = (typeof TREASURY_ACTOR_TYPES)[number];

/** Scopes collaborateur externe (TRESO-005 / 027) */
export const TREASURY_EXTERNAL_SCOPES = [
  'expense_requests.create',
] as const;
export type TreasuryExternalScope = (typeof TREASURY_EXTERNAL_SCOPES)[number];

// ─── Justificatifs ──────────────────────────────────────────────────────────

export interface FundAttachment {
  id: string;
  originalFilename: string;
  storedFilename: string;
  mimeType: string;
  fileSizeBytes: number;
  uploadedByUserId: string | null;
  createdAt: string;
}

// ─── Entrées de fonds ───────────────────────────────────────────────────────

export interface FundEntry {
  id: string;
  organizationId: string;
  amountCents: number;
  currency: string;
  operationDate: string;
  source: FundEntrySource;
  paymentMethod: TreasuryPaymentMethod;
  reference: string | null;
  notes: string | null;
  status: FundEntryStatus;
  voidedAt: string | null;
  voidedByUserId: string | null;
  voidReason: string | null;
  bookingIds: string[];
  attachments?: FundAttachment[];
  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface FundEntriesListQuery {
  page?: number;
  limit?: number;
  organizationId?: string;
  dateFrom?: string;
  dateTo?: string;
  currency?: string;
  source?: FundEntrySource;
  paymentMethod?: TreasuryPaymentMethod;
  status?: FundEntryStatus;
  bookingId?: string;
  search?: string;
}

export interface CreateFundEntryRequest {
  organizationId: string;
  amountCents: number;
  currency: string;
  operationDate: string;
  source: FundEntrySource;
  paymentMethod: TreasuryPaymentMethod;
  reference?: string | null;
  notes?: string | null;
  bookingIds?: string[];
}

export interface UpdateFundEntryRequest {
  amountCents?: number;
  currency?: string;
  operationDate?: string;
  source?: FundEntrySource;
  paymentMethod?: TreasuryPaymentMethod;
  reference?: string | null;
  notes?: string | null;
  bookingIds?: string[];
}

export interface VoidTreasuryOperationRequest {
  reason: string;
}

// ─── États de besoin ────────────────────────────────────────────────────────

export interface ExpenseRequest {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  requestedAmountCents: number;
  currency: string;
  status: ExpenseRequestStatus;
  requestedByUserId: string | null;
  requestedByExternalId: string | null;
  neededByDate: string | null;
  rejectionReason: string | null;
  submittedAt: string | null;
  validatedAt: string | null;
  validatedByUserId: string | null;
  authorizedAt: string | null;
  authorizedByUserId: string | null;
  closedAt: string | null;
  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface ExpenseRequestStatusHistoryEntry {
  id: string;
  expenseRequestId: string;
  fromStatus: ExpenseRequestStatus | null;
  toStatus: ExpenseRequestStatus;
  actorType: TreasuryActorType;
  actorId: string | null;
  comment: string | null;
  createdAt: string;
}

export interface ExpenseRequestsListQuery {
  page?: number;
  limit?: number;
  organizationId?: string;
  status?: ExpenseRequestStatus;
  search?: string;
}

export interface CreateExpenseRequestRequest {
  organizationId: string;
  title: string;
  description: string;
  requestedAmountCents: number;
  currency: string;
  neededByDate?: string | null;
}

export interface UpdateExpenseRequestRequest {
  title?: string;
  description?: string;
  requestedAmountCents?: number;
  currency?: string;
  neededByDate?: string | null;
}

/** Transition workflow (TRESO-022) */
export interface TransitionExpenseRequestRequest {
  toStatus: ExpenseRequestStatus;
  comment?: string | null;
}

/** Fund exit status transition (TRESO-022) — void = TRESO-033 */
export interface TransitionFundExitRequest {
  toStatus: Extract<FundExitStatus, 'disbursed' | 'recorded'>;
  comment?: string | null;
}

// ─── Sorties de fonds ───────────────────────────────────────────────────────

export interface FundExit {
  id: string;
  organizationId: string;
  /** Obligatoire — sortie toujours liée à un état de besoin */
  expenseRequestId: string;
  amountCents: number;
  currency: string;
  operationDate: string;
  paymentMethod: TreasuryPaymentMethod;
  reference: string | null;
  notes: string | null;
  status: FundExitStatus;
  voidedAt: string | null;
  voidedByUserId: string | null;
  voidReason: string | null;
  bookingIds: string[];
  attachments?: FundAttachment[];
  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface FundExitsListQuery {
  page?: number;
  limit?: number;
  organizationId?: string;
  expenseRequestId?: string;
  dateFrom?: string;
  dateTo?: string;
  currency?: string;
  paymentMethod?: TreasuryPaymentMethod;
  status?: FundExitStatus;
  bookingId?: string;
  search?: string;
}

export interface CreateFundExitRequest {
  organizationId: string;
  expenseRequestId: string;
  amountCents: number;
  currency: string;
  operationDate: string;
  paymentMethod: TreasuryPaymentMethod;
  reference?: string | null;
  notes?: string | null;
  bookingIds?: string[];
}

export interface UpdateFundExitRequest {
  amountCents?: number;
  currency?: string;
  operationDate?: string;
  paymentMethod?: TreasuryPaymentMethod;
  reference?: string | null;
  notes?: string | null;
  bookingIds?: string[];
}

// ─── Budgets ────────────────────────────────────────────────────────────────

export interface Budget {
  id: string;
  organizationId: string;
  label: string;
  periodType: BudgetPeriodType;
  year: number;
  /** 1–12 si monthly ; null si annual */
  month: number | null;
  amountCents: number;
  currency: string;
  scopeType: BudgetScopeType;
  activityId: string | null;
  productType: BudgetProductType | null;
  productId: string | null;
  notes: string | null;
  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface BudgetsListQuery {
  page?: number;
  limit?: number;
  organizationId?: string;
  periodType?: BudgetPeriodType;
  year?: number;
  month?: number;
  scopeType?: BudgetScopeType;
  activityId?: string;
  productType?: BudgetProductType;
  productId?: string;
  currency?: string;
  search?: string;
}

export interface CreateBudgetRequest {
  organizationId: string;
  label: string;
  periodType: BudgetPeriodType;
  year: number;
  month?: number | null;
  amountCents: number;
  currency: string;
  scopeType?: BudgetScopeType;
  activityId?: string | null;
  productType?: BudgetProductType | null;
  productId?: string | null;
  notes?: string | null;
}

export type UpdateBudgetRequest = Partial<
  Omit<CreateBudgetRequest, 'organizationId'>
>;

// ─── Collaborateurs externes ────────────────────────────────────────────────

export interface TreasuryExternalCollaborator {
  id: string;
  organizationId: string;
  email: string;
  displayName: string | null;
  isActive: boolean;
  scopes: TreasuryExternalScope[] | string[];
  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface TreasuryAccessToken {
  id: string;
  collaboratorId: string;
  /** Jamais le jeton brut — métadonnée uniquement côté API */
  expiresAt: string;
  scopes: TreasuryExternalScope[] | string[] | null;
  revokedAt: string | null;
  lastUsedAt: string | null;
  createdByUserId: string | null;
  createdAt: string;
}

export interface InviteTreasuryExternalCollaboratorRequest {
  organizationId: string;
  email: string;
  displayName?: string | null;
  scopes: TreasuryExternalScope[] | string[];
  /** Durée de validité du jeton en heures (défaut côté API) */
  tokenTtlHours?: number;
}

export interface UpdateTreasuryExternalCollaboratorRequest {
  displayName?: string | null;
  isActive?: boolean;
  scopes?: TreasuryExternalScope[] | string[];
}

// ─── Audit ──────────────────────────────────────────────────────────────────

export interface TreasuryAuditLog {
  id: string;
  organizationId: string;
  entityType: TreasuryAuditEntityType;
  entityId: string;
  action: TreasuryAuditAction;
  actorType: TreasuryActorType;
  actorId: string | null;
  oldJson: Record<string, unknown> | null;
  newJson: Record<string, unknown> | null;
  correlationId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface TreasuryAuditLogsListQuery {
  page?: number;
  limit?: number;
  organizationId?: string;
  entityType?: TreasuryAuditEntityType;
  entityId?: string;
  action?: TreasuryAuditAction;
  actorId?: string;
  dateFrom?: string;
  dateTo?: string;
}

// ─── Pont comptable stub (TRESO-039) ────────────────────────────────────────

export const ACCOUNTING_LINK_STATUSES = [
  'pending',
  'linked',
  'skipped',
] as const;
export type AccountingLinkStatus = (typeof ACCOUNTING_LINK_STATUSES)[number];

export const ACCOUNTING_FUND_OP_TYPES = ['fund_entry', 'fund_exit'] as const;
export type AccountingFundOpType = (typeof ACCOUNTING_FUND_OP_TYPES)[number];

export interface AccountingLink {
  id: string;
  organizationId: string;
  fundOpType: AccountingFundOpType;
  fundOpId: string;
  journalEntryId: string | null;
  mappingRuleKey: string | null;
  status: AccountingLinkStatus;
  createdAt: string;
  updatedAt: string | null;
}
