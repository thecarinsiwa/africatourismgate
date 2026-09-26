import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseAuditEntity } from '../common/entities/base-audit.entity';

/** Aligné sur docs/syscohada-domain-model.md §5.4 / §6.2 — SYSCO-003 */
export type AccountingJournalType =
  | 'cash'
  | 'bank'
  | 'purchases'
  | 'sales'
  | 'general'
  | 'other';

@Entity('accounting_journals')
export class AccountingJournals extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'organization_id', length: 36 })
  organizationId!: string;

  @Column({ type: 'varchar', name: 'code', length: 20 })
  code!: string;

  @Column({ type: 'varchar', name: 'label', length: 120 })
  label!: string;

  @Column({
    name: 'journal_type',
    type: 'enum',
    enum: ['cash', 'bank', 'purchases', 'sales', 'general', 'other'],
  })
  journalType!: AccountingJournalType;

  @Column({
    type: 'varchar',
    name: 'default_account_id',
    length: 36,
    nullable: true,
  })
  defaultAccountId!: string | null;

  @Column({ type: 'int', name: 'next_entry_seq', default: 1 })
  nextEntrySeq!: number;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive!: boolean;
}
