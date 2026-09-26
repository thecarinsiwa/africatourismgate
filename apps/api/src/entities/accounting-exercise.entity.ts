import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseAuditEntity } from '../common/entities/base-audit.entity';

/** Aligné sur docs/syscohada-domain-model.md §5.2–5.3 — SYSCO-002 */
export type AccountingExerciseStatus = 'open' | 'closing' | 'closed';

export type AccountingPeriodStatus = 'open' | 'locked' | 'closed';

@Entity('accounting_exercises')
export class AccountingExercises extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'organization_id', length: 36 })
  organizationId!: string;

  @Column({ type: 'varchar', name: 'code', length: 20 })
  code!: string;

  @Column({ type: 'varchar', name: 'label', length: 120 })
  label!: string;

  @Column({ type: 'date', name: 'starts_on' })
  startsOn!: string;

  @Column({ type: 'date', name: 'ends_on' })
  endsOn!: string;

  @Column({ type: 'char', name: 'currency', length: 3 })
  currency!: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ['open', 'closing', 'closed'],
    default: 'open',
  })
  status!: AccountingExerciseStatus;

  @Column({ type: 'datetime', name: 'closed_at', nullable: true })
  closedAt!: Date | null;

  @Column({
    type: 'varchar',
    name: 'closed_by_user_id',
    length: 36,
    nullable: true,
  })
  closedByUserId!: string | null;
}

@Entity('accounting_periods')
export class AccountingPeriods extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'exercise_id', length: 36 })
  exerciseId!: string;

  @Column({ type: 'varchar', name: 'organization_id', length: 36 })
  organizationId!: string;

  @Column({ type: 'varchar', name: 'code', length: 20 })
  code!: string;

  @Column({ type: 'date', name: 'starts_on' })
  startsOn!: string;

  @Column({ type: 'date', name: 'ends_on' })
  endsOn!: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ['open', 'locked', 'closed'],
    default: 'open',
  })
  status!: AccountingPeriodStatus;

  @Column({ type: 'smallint', name: 'sequence_no' })
  sequenceNo!: number;
}
