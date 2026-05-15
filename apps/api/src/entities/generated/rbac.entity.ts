import { Entity, Column, PrimaryColumn } from 'typeorm';
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
  description!: string;

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
  description!: string;

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
  grantedByUserId!: string;

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
  scopeId!: string;

  @Column({ type: 'varchar', name: 'assigned_by_user_id', length: 36, nullable: true })
  assignedByUserId!: string;

  @Column({ type: 'datetime', name: 'assigned_at' })
  assignedAt!: Date;

  @Column({ type: 'datetime', name: 'expires_at', nullable: true })
  expiresAt!: Date;

  @Column({ type: 'datetime', name: 'revoked_at', nullable: true })
  revokedAt!: Date;

  @Column({ type: 'varchar', name: 'revoked_by_user_id', length: 36, nullable: true })
  revokedByUserId!: string;

  @Column({ type: 'varchar', name: 'revoke_reason', length: 255, nullable: true })
  revokeReason!: string;

}

@Entity('rbac_audit_logs')
export class RbacAuditLogs extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'event_type', nullable: true })
  eventType!: unknown;

  @Column({ type: 'varchar', name: 'actor_user_id', length: 36, nullable: true })
  actorUserId!: string;

  @Column({ type: 'varchar', name: 'target_user_id', length: 36, nullable: true })
  targetUserId!: string;

  @Column({ type: 'varchar', name: 'role_id', length: 36, nullable: true })
  roleId!: string;

  @Column({ type: 'varchar', name: 'permission_id', length: 36, nullable: true })
  permissionId!: string;

  @Column({ type: 'varchar', name: 'assignment_id', length: 36, nullable: true })
  assignmentId!: string;

  @Column({ type: 'varchar', name: 'correlation_id', length: 36, nullable: true })
  correlationId!: string;

  @Column({ type: 'varchar', name: 'ip_address', length: 45, nullable: true })
  ipAddress!: string;

  @Column({ type: 'varchar', name: 'user_agent', length: 512, nullable: true })
  userAgent!: string;

  @Column({ type: 'json', name: 'payload', nullable: true })
  payload!: Record<string, unknown>;

}