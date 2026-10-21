import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

/** Aligné sur docs/syscohada-domain-model.md §5.9 */
export type AccountingAuditEntityType =
  | 'journal_entry'
  | 'journal_line'
  | 'chart_account'
  | 'exercise'
  | 'period'
  | 'mapping_rule'
  | 'accounting_link'
  | 'journal';

export type AccountingAuditAction =
  | 'create'
  | 'update'
  | 'post'
  | 'reverse'
  | 'lock'
  | 'unlock'
  | 'close'
  | 'skip'
  | 'delete';

export type AccountingAuditActorType = 'user' | 'system';

/**
 * Journal append-only comptabilité — ne pas UPDATE/DELETE depuis l’API (SYSCO-009).
 */
@Entity('accounting_audit_logs')
export class AccountingAuditLogs {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'organization_id', length: 36 })
  organizationId!: string;

  @Column({
    name: 'entity_type',
    type: 'enum',
    enum: [
      'journal_entry',
      'journal_line',
      'chart_account',
      'exercise',
      'period',
      'mapping_rule',
      'accounting_link',
      'journal',
    ],
  })
  entityType!: AccountingAuditEntityType;

  @Column({ type: 'varchar', name: 'entity_id', length: 36 })
  entityId!: string;

  @Column({
    name: 'action',
    type: 'enum',
    enum: [
      'create',
      'update',
      'post',
      'reverse',
      'lock',
      'unlock',
      'close',
      'skip',
      'delete',
    ],
  })
  action!: AccountingAuditAction;

  @Column({
    name: 'actor_type',
    type: 'enum',
    enum: ['user', 'system'],
    default: 'user',
  })
  actorType!: AccountingAuditActorType;

  @Column({ type: 'varchar', name: 'actor_id', length: 36, nullable: true })
  actorId!: string | null;

  @Column({ name: 'old_json', type: 'json', nullable: true })
  oldJson!: Record<string, unknown> | null;

  @Column({ name: 'new_json', type: 'json', nullable: true })
  newJson!: Record<string, unknown> | null;

  @Column({
    type: 'varchar',
    name: 'correlation_treasury_audit_id',
    length: 36,
    nullable: true,
  })
  correlationTreasuryAuditId!: string | null;

  @Column({ type: 'varchar', name: 'ip_address', length: 45, nullable: true })
  ipAddress!: string | null;

  @Column({ type: 'varchar', name: 'user_agent', length: 512, nullable: true })
  userAgent!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;
}
