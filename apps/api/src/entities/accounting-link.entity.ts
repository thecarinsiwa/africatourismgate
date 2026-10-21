import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseAuditEntity } from '../common/entities/base-audit.entity';

/** Aligné sur docs/tresorerie-domain-model.md §4.7 — stub pont comptable (TRESO-039). */
export type AccountingFundOpType = 'fund_entry' | 'fund_exit';

export type AccountingLinkStatus = 'pending' | 'linked' | 'skipped';

@Entity('accounting_links')
export class AccountingLinks extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'organization_id', length: 36 })
  organizationId!: string;

  @Column({
    name: 'fund_op_type',
    type: 'enum',
    enum: ['fund_entry', 'fund_exit'],
  })
  fundOpType!: AccountingFundOpType;

  @Column({ type: 'varchar', name: 'fund_op_id', length: 36 })
  fundOpId!: string;

  /** Rempli par SYSCO-004/005 (Comptabiliser → écriture posted). */
  @Column({ type: 'varchar', name: 'journal_entry_id', length: 36, nullable: true })
  journalEntryId!: string | null;

  @Column({
    type: 'varchar',
    name: 'mapping_rule_key',
    length: 120,
    nullable: true,
  })
  mappingRuleKey!: string | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ['pending', 'linked', 'skipped'],
    default: 'pending',
  })
  status!: AccountingLinkStatus;
}
