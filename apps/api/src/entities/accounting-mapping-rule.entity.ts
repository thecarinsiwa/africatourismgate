import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseAuditEntity } from '../common/entities/base-audit.entity';

/** Aligné sur docs/syscohada-domain-model.md §5.7 — SYSCO-004 */
export type AccountingMappingFundOpType = 'fund_entry' | 'fund_exit';

@Entity('accounting_mapping_rules')
export class AccountingMappingRules extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'organization_id', length: 36 })
  organizationId!: string;

  @Column({ type: 'varchar', name: 'key', length: 120 })
  key!: string;

  @Column({ type: 'int', name: 'version', default: 1 })
  version!: number;

  @Column({
    name: 'fund_op_type',
    type: 'enum',
    enum: ['fund_entry', 'fund_exit'],
  })
  fundOpType!: AccountingMappingFundOpType;

  @Column({ type: 'varchar', name: 'match_source', length: 40, nullable: true })
  matchSource!: string | null;

  @Column({
    type: 'varchar',
    name: 'match_payment_method',
    length: 40,
    nullable: true,
  })
  matchPaymentMethod!: string | null;

  @Column({ type: 'varchar', name: 'journal_id', length: 36 })
  journalId!: string;

  @Column({ type: 'varchar', name: 'debit_account_id', length: 36 })
  debitAccountId!: string;

  @Column({ type: 'varchar', name: 'credit_account_id', length: 36 })
  creditAccountId!: string;

  @Column({ type: 'int', name: 'priority', default: 0 })
  priority!: number;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ type: 'varchar', name: 'label', length: 255 })
  label!: string;

  @Column({ type: 'text', name: 'notes', nullable: true })
  notes!: string | null;
}
