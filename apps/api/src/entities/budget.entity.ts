import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseAuditEntity } from '../common/entities/base-audit.entity';

/** Aligné sur docs/tresorerie-domain-model.md §4.4 / §5.6 */
export type BudgetPeriodType = 'monthly' | 'annual';

export type BudgetScopeType = 'general' | 'activity' | 'product';

/** Aligné sur booking item types (produit / service) */
export type BudgetProductType =
  | 'room'
  | 'flight_class'
  | 'vehicle'
  | 'cabin'
  | 'activity_schedule'
  | 'package';

@Entity('budgets')
export class Budgets extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'organization_id', length: 36 })
  organizationId!: string;

  @Column({ type: 'varchar', name: 'label', length: 255 })
  label!: string;

  @Column({
    name: 'period_type',
    type: 'enum',
    enum: ['monthly', 'annual'],
  })
  periodType!: BudgetPeriodType;

  @Column({ type: 'smallint', name: 'year' })
  year!: number;

  /** 1–12 si monthly ; null si annual */
  @Column({ type: 'tinyint', name: 'month', nullable: true })
  month!: number | null;

  @Column({ type: 'int', name: 'amount_cents' })
  amountCents!: number;

  @Column({ type: 'char', name: 'currency', length: 3 })
  currency!: string;

  @Column({
    name: 'scope_type',
    type: 'enum',
    enum: ['general', 'activity', 'product'],
    default: 'general',
  })
  scopeType!: BudgetScopeType;

  @Column({ type: 'varchar', name: 'activity_id', length: 36, nullable: true })
  activityId!: string | null;

  @Column({
    name: 'product_type',
    type: 'enum',
    enum: ['room', 'flight_class', 'vehicle', 'cabin', 'activity_schedule', 'package'],
    nullable: true,
  })
  productType!: BudgetProductType | null;

  @Column({ type: 'varchar', name: 'product_id', length: 36, nullable: true })
  productId!: string | null;

  @Column({ type: 'text', name: 'notes', nullable: true })
  notes!: string | null;
}
