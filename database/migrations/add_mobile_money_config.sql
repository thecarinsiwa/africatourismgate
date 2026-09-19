-- Mobile Money config: countries → operators → payment numbers (org-scoped)

CREATE TABLE IF NOT EXISTS `mobile_money_countries` (
  `id` CHAR(36) NOT NULL,
  `organization_id` CHAR(36) NOT NULL,
  `code` CHAR(2) NOT NULL,
  `name` VARCHAR(120) NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_by_user_id` CHAR(36) DEFAULT NULL,
  `updated_by_user_id` CHAR(36) DEFAULT NULL,
  `deleted_by_user_id` CHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_mm_countries_org` (`organization_id`),
  KEY `idx_mm_countries_deleted` (`deleted_at`),
  KEY `idx_mm_countries_org_code` (`organization_id`, `code`),
  CONSTRAINT `fk_mm_countries_org`
    FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `mobile_money_operators` (
  `id` CHAR(36) NOT NULL,
  `country_id` CHAR(36) NOT NULL,
  `name` VARCHAR(120) NOT NULL,
  `logo_url` VARCHAR(512) DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_by_user_id` CHAR(36) DEFAULT NULL,
  `updated_by_user_id` CHAR(36) DEFAULT NULL,
  `deleted_by_user_id` CHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_mm_operators_country` (`country_id`),
  KEY `idx_mm_operators_deleted` (`deleted_at`),
  CONSTRAINT `fk_mm_operators_country`
    FOREIGN KEY (`country_id`) REFERENCES `mobile_money_countries` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `mobile_money_payment_numbers` (
  `id` CHAR(36) NOT NULL,
  `operator_id` CHAR(36) NOT NULL,
  `phone_e164` VARCHAR(32) NOT NULL,
  `label` VARCHAR(120) DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_by_user_id` CHAR(36) DEFAULT NULL,
  `updated_by_user_id` CHAR(36) DEFAULT NULL,
  `deleted_by_user_id` CHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_mm_numbers_operator` (`operator_id`),
  KEY `idx_mm_numbers_deleted` (`deleted_at`),
  CONSTRAINT `fk_mm_numbers_operator`
    FOREIGN KEY (`operator_id`) REFERENCES `mobile_money_operators` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `permissions` (`id`, `code`, `resource`, `action`, `description`) VALUES
('00000000-0000-4000-8000-000000001054', 'mobile_money.read', 'mobile_money', 'read', 'View Mobile Money payment config'),
('00000000-0000-4000-8000-000000001055', 'mobile_money.write', 'mobile_money', 'write', 'Manage Mobile Money payment config');

INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`, `granted_by_user_id`)
SELECT r.`id`, p.`id`, u.`id`
FROM `permissions` p
JOIN `roles` r ON r.`id` = '00000000-0000-4000-8000-000000000100'
JOIN `users` u ON u.`id` = '00000000-0000-4000-8000-000000000010'
WHERE p.`id` IN (
  '00000000-0000-4000-8000-000000001054',
  '00000000-0000-4000-8000-000000001055'
);

INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`, `granted_by_user_id`)
SELECT r.`id`, p.`id`, u.`id`
FROM `permissions` p
JOIN `roles` r ON r.`id` = '00000000-0000-4000-8000-000000000101'
JOIN `users` u ON u.`id` = '00000000-0000-4000-8000-000000000010'
WHERE p.`id` IN (
  '00000000-0000-4000-8000-000000001054',
  '00000000-0000-4000-8000-000000001055'
);
