export const SUPER_ADMIN_ROLE_CODE = 'super_admin';

export const RBAC_EVENT_PERMISSION_DENIED = 'permission_denied' as const;

export const RBAC_AUDIT_EVENT_TYPES = [
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
] as const;

export type RbacAuditEventType = (typeof RBAC_AUDIT_EVENT_TYPES)[number];

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

export const PERMISSIONS_KEY = 'permissions';
