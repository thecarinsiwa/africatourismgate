-- First-party site analytics: anonymous page views from apps/web

CREATE TABLE IF NOT EXISTS `site_page_views` (
  `id` CHAR(36) NOT NULL,
  `visitor_id` CHAR(36) NOT NULL,
  `path` VARCHAR(512) NOT NULL,
  `locale` VARCHAR(10) DEFAULT NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_spv_created` (`created_at`),
  KEY `idx_spv_visitor_created` (`visitor_id`, `created_at`),
  KEY `idx_spv_path_created` (`path`(191), `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `permissions` (`id`, `code`, `resource`, `action`, `description`) VALUES
('00000000-0000-4000-8000-000000001056', 'analytics.read', 'analytics', 'read', 'View site analytics (visitors, page views)');

INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`, `granted_by_user_id`)
SELECT r.`id`, p.`id`, u.`id`
FROM `permissions` p
JOIN `roles` r ON r.`id` = '00000000-0000-4000-8000-000000000100'
JOIN `users` u ON u.`id` = '00000000-0000-4000-8000-000000000010'
WHERE p.`id` = '00000000-0000-4000-8000-000000001056';

INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`, `granted_by_user_id`)
SELECT r.`id`, p.`id`, u.`id`
FROM `permissions` p
JOIN `roles` r ON r.`id` = '00000000-0000-4000-8000-000000000101'
JOIN `users` u ON u.`id` = '00000000-0000-4000-8000-000000000010'
WHERE p.`id` = '00000000-0000-4000-8000-000000001056';
