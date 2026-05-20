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
