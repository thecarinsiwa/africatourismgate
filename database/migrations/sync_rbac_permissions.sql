-- Idempotent RBAC repair (run manually if API auto-sync is disabled)
-- Grants missing permissions, links super_admin to all permissions,
-- adds roles.read / roles.write / permissions.read to org_admin,
-- restores seed admin super_admin assignment.

SET NAMES utf8mb4;

INSERT INTO `permissions` (`id`, `code`, `resource`, `action`, `description`) VALUES
('00000000-0000-4000-8000-000000001016', 'roles.read', 'roles', 'read', 'View roles'),
('00000000-0000-4000-8000-000000001017', 'roles.write', 'roles', 'write', 'Manage roles'),
('00000000-0000-4000-8000-000000001018', 'permissions.read', 'permissions', 'read', 'View permissions'),
('00000000-0000-4000-8000-000000001027', 'employees.read', 'employees', 'read', 'View employees'),
('00000000-0000-4000-8000-000000001028', 'employees.write', 'employees', 'write', 'Manage employees')
ON DUPLICATE KEY UPDATE
  `code` = VALUES(`code`),
  `resource` = VALUES(`resource`),
  `action` = VALUES(`action`),
  `description` = VALUES(`description`),
  `deleted_at` = NULL;

INSERT INTO `role_permissions` (`role_id`, `permission_id`, `granted_by_user_id`)
SELECT '00000000-0000-4000-8000-000000000100', p.`id`, '00000000-0000-4000-8000-000000000010'
FROM `permissions` p
WHERE p.`deleted_at` IS NULL
ON DUPLICATE KEY UPDATE
  `deleted_at` = NULL,
  `granted_by_user_id` = VALUES(`granted_by_user_id`);

INSERT INTO `role_permissions` (`role_id`, `permission_id`, `granted_by_user_id`) VALUES
('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000001016', '00000000-0000-4000-8000-000000000010'),
('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000001017', '00000000-0000-4000-8000-000000000010'),
('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000001018', '00000000-0000-4000-8000-000000000010')
ON DUPLICATE KEY UPDATE
  `deleted_at` = NULL,
  `granted_by_user_id` = VALUES(`granted_by_user_id`);

INSERT INTO `user_role_assignments` (
  `id`, `user_id`, `role_id`, `scope_type`, `assigned_by_user_id`
) VALUES (
  '00000000-0000-4000-8000-000000000050',
  '00000000-0000-4000-8000-000000000010',
  '00000000-0000-4000-8000-000000000100',
  'global',
  '00000000-0000-4000-8000-000000000010'
)
ON DUPLICATE KEY UPDATE
  `revoked_at` = NULL,
  `revoked_by_user_id` = NULL,
  `revoke_reason` = NULL,
  `deleted_at` = NULL;
