-- GAP coordinator system role — gap.read + gap.write only
SET NAMES utf8mb4;

INSERT INTO `roles` (`id`, `code`, `name`, `description`, `is_system`) VALUES
(
  '00000000-0000-4000-8000-000000000104',
  'gap_coordinator',
  'GAP coordinator',
  'Manage Gorilla Ambassadors Program (GAP) content',
  1
)
ON DUPLICATE KEY UPDATE
  `code` = VALUES(`code`),
  `name` = VALUES(`name`),
  `description` = VALUES(`description`),
  `is_system` = VALUES(`is_system`),
  `deleted_at` = NULL;

INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`, `granted_by_user_id`)
SELECT r.`id`, p.`id`, u.`id`
FROM `permissions` p
JOIN `roles` r ON r.`id` = '00000000-0000-4000-8000-000000000104'
JOIN `users` u ON u.`id` = '00000000-0000-4000-8000-000000000010'
WHERE p.`id` IN (
  '00000000-0000-4000-8000-000000001050',
  '00000000-0000-4000-8000-000000001051'
);
