import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';
import { BaseAuditEntity } from '../common/entities/base-audit.entity';

/**
 * Collaborateur externe trésorerie (invitation e-mail + activation).
 * Aligné sur docs/tresorerie-domain-model.md §4.5
 */
@Entity('treasury_external_collaborators')
export class TreasuryExternalCollaborators extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'organization_id', length: 36 })
  organizationId!: string;

  @Column({ type: 'varchar', name: 'email', length: 255 })
  email!: string;

  @Column({ type: 'varchar', name: 'display_name', length: 255, nullable: true })
  displayName!: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  /** Ex. ["expense_requests.create"] */
  @Column({ name: 'scopes', type: 'json' })
  scopes!: string[];
}

/**
 * Jeton d’accès sécurisé — seul le hash est persisté.
 * Traçabilité actions : treasury_audit_logs (TRESO-006) avec actor_type=external.
 */
@Entity('treasury_access_tokens')
export class TreasuryAccessTokens {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'collaborator_id', length: 36 })
  collaboratorId!: string;

  @Column({ type: 'varchar', name: 'token_hash', length: 64 })
  tokenHash!: string;

  @Column({ type: 'datetime', name: 'expires_at' })
  expiresAt!: Date;

  /** Snapshot à l’émission ; null = hérite des scopes du collaborateur */
  @Column({ name: 'scopes', type: 'json', nullable: true })
  scopes!: string[] | null;

  @Column({ type: 'datetime', name: 'revoked_at', nullable: true })
  revokedAt!: Date | null;

  @Column({ type: 'datetime', name: 'last_used_at', nullable: true })
  lastUsedAt!: Date | null;

  @Column({ type: 'varchar', name: 'created_by_user_id', length: 36, nullable: true })
  createdByUserId!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;
}
