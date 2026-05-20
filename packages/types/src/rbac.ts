import type { PaginationQuery } from './pagination.js';

export type ScopeType = 'global' | 'property' | 'agency' | 'support_queue';

export interface Role {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface Permission {
  id: string;
  code: string;
  resource: string;
  action: string;
  description: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface RolePermissionsPayload {
  roleId: string;
  permissionIds: string[];
}

export interface UserRoleAssignment {
  id: string;
  userId: string;
  roleId: string;
  scopeType: ScopeType;
  scopeId: string | null;
  assignedByUserId: string | null;
  assignedAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
  revokedByUserId: string | null;
  revokeReason: string | null;
  createdAt: string;
  updatedAt: string | null;
  user?: { id: string; email: string; firstName: string; lastName: string };
  role?: { id: string; code: string; name: string };
}

export interface CreateRoleRequest {
  code: string;
  name: string;
  description?: string;
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string | null;
}

export interface RolesListQuery extends PaginationQuery {
  search?: string;
  includeSystem?: boolean;
}

export interface PermissionsListQuery extends PaginationQuery {
  resource?: string;
  search?: string;
}

export interface ReplaceRolePermissionsRequest {
  permissionIds: string[];
}

export interface CreateUserRoleAssignmentRequest {
  userId: string;
  roleId: string;
  scopeType: ScopeType;
  scopeId?: string;
  expiresAt?: string;
}

export interface UserRoleAssignmentsListQuery extends PaginationQuery {
  userId?: string;
  roleId?: string;
  includeRevoked?: boolean;
}

export type RbacAuditEventType =
  | 'role_created'
  | 'role_updated'
  | 'role_deleted'
  | 'permission_created'
  | 'permission_updated'
  | 'permission_deleted'
  | 'role_permission_granted'
  | 'role_permission_revoked'
  | 'user_role_granted'
  | 'user_role_revoked'
  | 'user_role_extended'
  | 'impersonation_started'
  | 'impersonation_ended'
  | 'permission_denied';

export interface RbacAuditActor {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface RbacAuditLog {
  id: string;
  eventType: RbacAuditEventType;
  createdAt: string;
  actorUserId: string | null;
  actor: RbacAuditActor | null;
  targetUserId: string | null;
  roleId: string | null;
  permissionId: string | null;
  assignmentId: string | null;
  correlationId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  payload: Record<string, unknown> | null;
}

export interface RbacAuditLogsListQuery extends PaginationQuery {
  eventType?: RbacAuditEventType;
  actorUserId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const RBAC_AUDIT_EVENT_TYPES: RbacAuditEventType[] = [
  'role_created',
  'role_updated',
  'role_deleted',
  'permission_created',
  'permission_updated',
  'permission_deleted',
  'role_permission_granted',
  'role_permission_revoked',
  'user_role_granted',
  'user_role_revoked',
  'user_role_extended',
  'impersonation_started',
  'impersonation_ended',
  'permission_denied',
];

/** French labels for audit event types (admin UI). */
export const RBAC_AUDIT_EVENT_LABELS: Record<RbacAuditEventType, string> = {
  role_created: 'Rôle créé',
  role_updated: 'Rôle modifié',
  role_deleted: 'Rôle supprimé',
  permission_created: 'Permission créée',
  permission_updated: 'Permission modifiée',
  permission_deleted: 'Permission supprimée',
  role_permission_granted: 'Permission accordée au rôle',
  role_permission_revoked: 'Permission retirée du rôle',
  user_role_granted: 'Rôle assigné',
  user_role_revoked: 'Rôle révoqué',
  user_role_extended: 'Assignation prolongée',
  impersonation_started: 'Impersonation démarrée',
  impersonation_ended: 'Impersonation terminée',
  permission_denied: 'Accès refusé',
};
