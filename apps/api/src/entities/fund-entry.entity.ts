import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';
import { BaseAuditEntity } from '../common/entities/base-audit.entity';

/** Aligné sur docs/tresorerie-domain-model.md §5.1 */
export type FundEntrySource =
  | 'booking_payment'
  | 'customer_direct'
  | 'partner'
  | 'grant_donation'
  | 'owner_capital'
  | 'bank_interest'
  | 'other';

/** Aligné sur docs/tresorerie-domain-model.md §5.2 */
export type TreasuryPaymentMethod =
  | 'cash'
  | 'bank_transfer'
  | 'mobile_money'
  | 'stripe'
  | 'cheque'
  | 'other';

export type FundEntryStatus = 'recorded' | 'voided';

@Entity('fund_entries')
export class FundEntries extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'organization_id', length: 36 })
  organizationId!: string;

  @Column({ type: 'int', name: 'amount_cents' })
  amountCents!: number;

  @Column({ type: 'char', name: 'currency', length: 3 })
  currency!: string;

  @Column({ type: 'date', name: 'operation_date' })
  operationDate!: string;

  @Column({
    name: 'source',
    type: 'enum',
    enum: [
      'booking_payment',
      'customer_direct',
      'partner',
      'grant_donation',
      'owner_capital',
      'bank_interest',
      'other',
    ],
  })
  source!: FundEntrySource;

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
    enum: ['recorded', 'voided'],
    default: 'recorded',
  })
  status!: FundEntryStatus;

  @Column({ type: 'datetime', name: 'voided_at', nullable: true })
  voidedAt!: Date | null;

  @Column({ type: 'varchar', name: 'voided_by_user_id', length: 36, nullable: true })
  voidedByUserId!: string | null;

  @Column({ type: 'text', name: 'void_reason', nullable: true })
  voidReason!: string | null;
}

@Entity('fund_entry_bookings')
export class FundEntryBookings {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'fund_entry_id', length: 36 })
  fundEntryId!: string;

  @Column({ type: 'varchar', name: 'booking_id', length: 36 })
  bookingId!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;
}

@Entity('fund_entry_attachments')
export class FundEntryAttachments {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'fund_entry_id', length: 36 })
  fundEntryId!: string;

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
