import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';
import { BaseAuditEntity } from '../common/entities/base-audit.entity';
import type { TreasuryPaymentMethod } from './fund-entry.entity';

/** Aligné sur docs/tresorerie-domain-model.md §5.3 */
export type ExpenseRequestStatus =
  | 'draft'
  | 'submitted'
  | 'validated'
  | 'authorized'
  | 'rejected'
  | 'cancelled'
  | 'closed';

export type ExpenseRequestActorType = 'user' | 'external' | 'system';

export type FundExitStatus = 'draft' | 'disbursed' | 'recorded' | 'voided';

const EXPENSE_REQUEST_STATUSES: ExpenseRequestStatus[] = [
  'draft',
  'submitted',
  'validated',
  'authorized',
  'rejected',
  'cancelled',
  'closed',
];

@Entity('expense_requests')
export class ExpenseRequests extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'organization_id', length: 36 })
  organizationId!: string;

  @Column({ type: 'varchar', name: 'title', length: 255 })
  title!: string;

  @Column({ type: 'text', name: 'description' })
  description!: string;

  @Column({ type: 'int', name: 'requested_amount_cents' })
  requestedAmountCents!: number;

  @Column({ type: 'char', name: 'currency', length: 3 })
  currency!: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: EXPENSE_REQUEST_STATUSES,
    default: 'draft',
  })
  status!: ExpenseRequestStatus;

  @Column({ type: 'varchar', name: 'requested_by_user_id', length: 36, nullable: true })
  requestedByUserId!: string | null;

  /** FK vers treasury_external_collaborators ajoutée en TRESO-005 */
  @Column({ type: 'varchar', name: 'requested_by_external_id', length: 36, nullable: true })
  requestedByExternalId!: string | null;

  @Column({ type: 'date', name: 'needed_by_date', nullable: true })
  neededByDate!: string | null;

  @Column({ type: 'text', name: 'rejection_reason', nullable: true })
  rejectionReason!: string | null;

  @Column({ type: 'datetime', name: 'submitted_at', nullable: true })
  submittedAt!: Date | null;

  @Column({ type: 'datetime', name: 'validated_at', nullable: true })
  validatedAt!: Date | null;

  @Column({ type: 'varchar', name: 'validated_by_user_id', length: 36, nullable: true })
  validatedByUserId!: string | null;

  @Column({ type: 'datetime', name: 'authorized_at', nullable: true })
  authorizedAt!: Date | null;

  @Column({ type: 'varchar', name: 'authorized_by_user_id', length: 36, nullable: true })
  authorizedByUserId!: string | null;

  @Column({ type: 'datetime', name: 'closed_at', nullable: true })
  closedAt!: Date | null;
}

@Entity('expense_request_status_history')
export class ExpenseRequestStatusHistory {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'expense_request_id', length: 36 })
  expenseRequestId!: string;

  @Column({
    name: 'from_status',
    type: 'enum',
    enum: EXPENSE_REQUEST_STATUSES,
    nullable: true,
  })
  fromStatus!: ExpenseRequestStatus | null;

  @Column({
    name: 'to_status',
    type: 'enum',
    enum: EXPENSE_REQUEST_STATUSES,
  })
  toStatus!: ExpenseRequestStatus;

  @Column({
    name: 'actor_type',
    type: 'enum',
    enum: ['user', 'external', 'system'],
    default: 'user',
  })
  actorType!: ExpenseRequestActorType;

  @Column({ type: 'varchar', name: 'actor_id', length: 36, nullable: true })
  actorId!: string | null;

  @Column({ type: 'text', name: 'comment', nullable: true })
  comment!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;
}

@Entity('fund_exits')
export class FundExits extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'organization_id', length: 36 })
  organizationId!: string;

  /** NOT NULL en DB — une sortie exige toujours un état de besoin */
  @Column({ type: 'varchar', name: 'expense_request_id', length: 36 })
  expenseRequestId!: string;

  @Column({ type: 'int', name: 'amount_cents' })
  amountCents!: number;

  @Column({ type: 'char', name: 'currency', length: 3 })
  currency!: string;

  @Column({ type: 'date', name: 'operation_date' })
  operationDate!: string;

  @Column({
    name: 'payment_method',
    type: 'enum',
    enum: ['cash', 'bank_transfer', 'mobile_money', 'stripe', 'cheque', 'other'],
  })
  paymentMethod!: TreasuryPaymentMethod;

  @Column({ type: 'varchar', name: 'reference', length: 120, nullable: true })
  reference!: string | null;

  @Column({ type: 'text', name: 'notes', nullable: true })
  notes!: string | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ['draft', 'disbursed', 'recorded', 'voided'],
    default: 'draft',
  })
  status!: FundExitStatus;

  @Column({ type: 'datetime', name: 'voided_at', nullable: true })
  voidedAt!: Date | null;

  @Column({ type: 'varchar', name: 'voided_by_user_id', length: 36, nullable: true })
  voidedByUserId!: string | null;

  @Column({ type: 'text', name: 'void_reason', nullable: true })
  voidReason!: string | null;
}

@Entity('fund_exit_bookings')
export class FundExitBookings {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'fund_exit_id', length: 36 })
  fundExitId!: string;

  @Column({ type: 'varchar', name: 'booking_id', length: 36 })
  bookingId!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;
}

@Entity('fund_exit_attachments')
export class FundExitAttachments {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'fund_exit_id', length: 36 })
  fundExitId!: string;

  @Column({ type: 'varchar', name: 'original_filename', length: 255 })
  originalFilename!: string;

  @Column({ type: 'varchar', name: 'stored_filename', length: 255 })
  storedFilename!: string;

  @Column({ type: 'varchar', name: 'mime_type', length: 127 })
  mimeType!: string;

  @Column({ type: 'int', name: 'file_size_bytes', unsigned: true })
  fileSizeBytes!: number;

  @Column({ type: 'varchar', name: 'uploaded_by_user_id', length: 36, nullable: true })
  uploadedByUserId!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @Column({ type: 'datetime', name: 'deleted_at', nullable: true })
  deletedAt!: Date | null;
}
