import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseAuditEntity } from '../common/entities/base-audit.entity';

/** Aligné sur docs/syscohada-domain-model.md §5.5–5.6 — SYSCO-003 */
export type JournalEntryStatus = 'draft' | 'posted' | 'reversed';

export type JournalEntrySource =
  | 'treasury_mapping'
  | 'manual'
  | 'closing'
  | 'reversal';

@Entity('journal_entries')
export class JournalEntries extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'organization_id', length: 36 })
  organizationId!: string;

  @Column({ type: 'varchar', name: 'journal_id', length: 36 })
  journalId!: string;

  @Column({ type: 'varchar', name: 'exercise_id', length: 36 })
  exerciseId!: string;

  @Column({ type: 'varchar', name: 'period_id', length: 36 })
  periodId!: string;

  @Column({ type: 'varchar', name: 'entry_number', length: 40 })
  entryNumber!: string;

  @Column({ type: 'int', name: 'entry_seq' })
  entrySeq!: number;

  @Column({ type: 'date', name: 'entry_date' })
  entryDate!: string;

  @Column({ type: 'varchar', name: 'description', length: 500 })
  description!: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ['draft', 'posted', 'reversed'],
    default: 'draft',
  })
  status!: JournalEntryStatus;

  @Column({
    name: 'source',
    type: 'enum',
    enum: ['treasury_mapping', 'manual', 'closing', 'reversal'],
    default: 'manual',
  })
  source!: JournalEntrySource;

  @Column({
    type: 'varchar',
    name: 'reverses_entry_id',
    length: 36,
    nullable: true,
  })
  reversesEntryId!: string | null;

  @Column({ type: 'datetime', name: 'posted_at', nullable: true })
  postedAt!: Date | null;

  @Column({
    type: 'varchar',
    name: 'posted_by_user_id',
    length: 36,
    nullable: true,
  })
  postedByUserId!: string | null;

  @Column({ type: 'char', name: 'currency', length: 3 })
  currency!: string;
}

@Entity('journal_lines')
export class JournalLines extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'journal_entry_id', length: 36 })
  journalEntryId!: string;

  @Column({ type: 'varchar', name: 'organization_id', length: 36 })
  organizationId!: string;

  @Column({ type: 'smallint', name: 'line_no' })
  lineNo!: number;

  @Column({ type: 'varchar', name: 'account_id', length: 36 })
  accountId!: string;

  @Column({ type: 'varchar', name: 'label', length: 255, nullable: true })
  label!: string | null;

  @Column({ type: 'int', name: 'debit_cents', default: 0 })
  debitCents!: number;

  @Column({ type: 'int', name: 'credit_cents', default: 0 })
  creditCents!: number;

  @Column({ type: 'int', name: 'original_amount_cents', nullable: true })
  originalAmountCents!: number | null;

  @Column({
    type: 'char',
    name: 'original_currency',
    length: 3,
    nullable: true,
  })
  originalCurrency!: string | null;

  @Column({
    type: 'decimal',
    name: 'fx_rate',
    precision: 18,
    scale: 8,
    nullable: true,
  })
  fxRate!: string | null;

  @Column({
    type: 'varchar',
    name: 'analytic_ref_type',
    length: 40,
    nullable: true,
  })
  analyticRefType!: string | null;

  @Column({
    type: 'varchar',
    name: 'analytic_ref_id',
    length: 36,
    nullable: true,
  })
  analyticRefId!: string | null;
}
