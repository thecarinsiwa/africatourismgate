import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseAuditEntity } from '../common/entities/base-audit.entity';

/** Aligné sur docs/syscohada-domain-model.md §5.1 / §6.1 — SYSCO-002 */
export type ChartAccountType =
  | 'equity'
  | 'fixed_asset'
  | 'inventory'
  | 'third_party'
  | 'treasury'
  | 'expense'
  | 'revenue'
  | 'special';

@Entity('chart_of_accounts')
export class ChartOfAccounts extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'organization_id', length: 36 })
  organizationId!: string;

  @Column({ type: 'varchar', name: 'code', length: 20 })
  code!: string;

  @Column({ type: 'varchar', name: 'label', length: 255 })
  label!: string;

  @Column({ type: 'tinyint', name: 'class_number' })
  classNumber!: number;

  @Column({
    name: 'account_type',
    type: 'enum',
    enum: [
      'equity',
      'fixed_asset',
      'inventory',
      'third_party',
      'treasury',
      'expense',
      'revenue',
      'special',
    ],
  })
  accountType!: ChartAccountType;

  @Column({ type: 'varchar', name: 'parent_id', length: 36, nullable: true })
  parentId!: string | null;

  @Column({ type: 'boolean', name: 'is_postable', default: true })
  isPostable!: boolean;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive!: boolean;

  @Column({
    type: 'varchar',
    name: 'syscohada_ref',
    length: 20,
    nullable: true,
  })
  syscohadaRef!: string | null;
}
