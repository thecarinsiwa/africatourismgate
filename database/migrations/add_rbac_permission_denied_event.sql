-- Extend rbac_audit_logs.event_type for API permission denials (idempotent on fresh DBs)
ALTER TABLE `rbac_audit_logs`
  MODIFY COLUMN `event_type` ENUM(
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
    'permission_denied'
  ) NOT NULL;
