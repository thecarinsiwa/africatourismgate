import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

/** Aligné sur docs/tresorerie-domain-model.md §4.6 */
export type TreasuryAuditEntityType =
  | 'fund_entry'
  | 'fund_exit'
  | 'expense_request'
  | 'budget'
  | 'external_collaborator'
  | 'access_token'
  | 'accounting_link';

export type TreasuryAuditAction =
  | 'create'
  | 'update'
  | 'transition'
  | 'void'
  | 'attach'
  | 'detach'
  | 'invite'
  | 'activate'
  | 'deactivate'
  | 'revoke_token';

export type TreasuryAuditActorType = 'user' | 'external' | 'system';

/**
 * Journal append-only — ne pas UPDATE/DELETE depuis l’API (TRESO-031).
 * Pattern voisin de `rbac_audit_logs` (actor + payload JSON + created_at).
 */
@Entity('treasury_audit_logs')
export class TreasuryAuditLogs {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'organization_id', length: 36 })
  organizationId!: string;

  @Column({
    name: 'entity_type',
    type: 'enum',
    enum: [
      'fund_entry',
      'fund_exit',
      'expense_request',
      'budget',
      'external_collaborator',
      'access_token',
      'accounting_link',
    ],
  })
  entityType!: TreasuryAuditEntityType;

  @Column({ type: 'varchar', name: 'entity_id', length: 36 })
  entityId!: string;

  @Column({
    name: 'action',
    type: 'enum',
    enum: [
      'create',
      'update',
      'transition',
      'void',
      'attach',
      'detach',
      'invite',
      'activate',
      'deactivate',
      'revoke_token',
    ],
  })
  action!: TreasuryAuditAction;

  @Column({
    name: 'actor_type',
    type: 'enum',
    enum: ['user', 'external', 'system'],
    default: 'user',
  })
  actorType!: TreasuryAuditActorType;

  @Column({ type: 'varchar', name: 'actor_id', length: 36, nullable: true })
  actorId!: string | null;

  @Column({ name: 'old_json', type: 'json', nullable: true })
  oldJson!: Record<string, unknown> | null;

  @Column({ name: 'new_json', type: 'json', nullable: true })
  newJson!: Record<string, unknown> | null;

  @Column({ type: 'varchar', name: 'correlation_id', length: 36, nullable: true })
  correlationId!: string | null;

  @Column({ type: 'varchar', name: 'ip_address', length: 45, nullable: true })
  ipAddress!: string | null;

  @Column({ type: 'varchar', name: 'user_agent', length: 512, nullable: true })
  userAgent!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;
}
