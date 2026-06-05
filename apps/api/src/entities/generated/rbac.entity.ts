import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';
import { BaseAuditEntity } from '../../common/entities/base-audit.entity';
@Entity('permissions')
export class Permissions extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'code', length: 128 })
  code!: string;

  @Column({ type: 'varchar', name: 'resource', length: 64 })
  resource!: string;

  @Column({ type: 'varchar', name: 'action', length: 64 })
  action!: string;

  @Column({ type: 'varchar', name: 'description', length: 255, nullable: true })
  description!: string | null;

}

@Entity('roles')
export class Roles extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'code', length: 64 })
  code!: string;

  @Column({ type: 'varchar', name: 'name', length: 128 })
  name!: string;

  @Column({ type: 'text', name: 'description', nullable: true })
  description!: string | null;

  @Column({ type: 'int', name: 'is_system' })
  isSystem!: number;

}

@Entity('role_permissions')
export class RolePermissions extends BaseAuditEntity {
  @PrimaryColumn({ name: 'role_id', length: 36 })
  roleId!: string;

  @PrimaryColumn({ name: 'permission_id', length: 36 })
  permissionId!: string;

  @Column({ type: 'datetime', name: 'granted_at' })
  grantedAt!: Date;

  @Column({ type: 'varchar', name: 'granted_by_user_id', length: 36, nullable: true })
  grantedByUserId!: string | null;

}

@Entity('user_role_assignments')
export class UserRoleAssignments extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'user_id', length: 36 })
  userId!: string;

  @Column({ type: 'varchar', name: 'role_id', length: 36 })
  roleId!: string;

  @Column({ name: 'scope_type', enum: ["global","property","agency","support_queue"] })
  scopeType!: 'global' | 'property' | 'agency' | 'support_queue';

  @Column({ type: 'varchar', name: 'scope_id', length: 36, nullable: true })
  scopeId!: string | null;

  @Column({ type: 'varchar', name: 'assigned_by_user_id', length: 36, nullable: true })
  assignedByUserId!: string | null;

  @Column({ type: 'datetime', name: 'assigned_at' })
  assignedAt!: Date;

  @Column({ type: 'datetime', name: 'expires_at', nullable: true })
  expiresAt!: Date | null;

  @Column({ type: 'datetime', name: 'revoked_at', nullable: true })
  revokedAt!: Date | null;

  @Column({ type: 'varchar', name: 'revoked_by_user_id', length: 36, nullable: true })
  revokedByUserId!: string | null;

  @Column({ type: 'varchar', name: 'revoke_reason', length: 255, nullable: true })
  revokeReason!: string | null;

}

@Entity('rbac_audit_logs')
export class RbacAuditLogs extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'event_type', nullable: true })
  eventType!: unknown | null;

  @Column({ type: 'varchar', name: 'actor_user_id', length: 36, nullable: true })
  actorUserId!: string | null;

  @Column({ type: 'varchar', name: 'target_user_id', length: 36, nullable: true })
  targetUserId!: string | null;

  @Column({ type: 'varchar', name: 'role_id', length: 36, nullable: true })
  roleId!: string | null;

  @Column({ type: 'varchar', name: 'permission_id', length: 36, nullable: true })
  permissionId!: string | null;

  @Column({ type: 'varchar', name: 'assignment_id', length: 36, nullable: true })
  assignmentId!: string | null;

  @Column({ type: 'varchar', name: 'correlation_id', length: 36, nullable: true })
  correlationId!: string | null;

  @Column({ type: 'varchar', name: 'ip_address', length: 45, nullable: true })
  ipAddress!: string | null;

  @Column({ type: 'varchar', name: 'user_agent', length: 512, nullable: true })
  userAgent!: string | null;

  @Column({ type: 'json', name: 'payload', nullable: true })
  payload!: Record<string, unknown> | null;

}