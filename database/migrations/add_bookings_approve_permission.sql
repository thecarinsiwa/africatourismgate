-- CE-5: RBAC permission for assisted booking approval
SET NAMES utf8mb4;

INSERT IGNORE INTO `permissions` (`id`, `code`, `resource`, `action`, `description`) VALUES
('00000000-0000-4000-8000-000000001045', 'bookings.approve', 'bookings', 'approve', 'Approve or reject assisted booking requests');

INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`, `granted_by_user_id`)
SELECT r.`id`, p.`id`, u.`id`
FROM `permissions` p
JOIN `roles` r ON r.`id` = '00000000-0000-4000-8000-000000000100'
JOIN `users` u ON u.`id` = '00000000-0000-4000-8000-000000000010'
WHERE p.`id` = '00000000-0000-4000-8000-000000001045';

INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`, `granted_by_user_id`)
SELECT r.`id`, p.`id`, u.`id`
FROM `permissions` p
JOIN `roles` r ON r.`id` = '00000000-0000-4000-8000-000000000101'
JOIN `users` u ON u.`id` = '00000000-0000-4000-8000-000000000010'
WHERE p.`id` = '00000000-0000-4000-8000-000000001045';

INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`, `granted_by_user_id`)
SELECT r.`id`, p.`id`, u.`id`
FROM `permissions` p
JOIN `roles` r ON r.`id` = '00000000-0000-4000-8000-000000000102'
JOIN `users` u ON u.`id` = '00000000-0000-4000-8000-000000000010'
WHERE p.`id` = '00000000-0000-4000-8000-000000001045';
