-- Catalogue global de devises (plateforme) — CRUD Admin /système/devises
-- Down (manuel) : voir commentaires en bas de fichier.
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `currencies` (
  `id` CHAR(36) NOT NULL,
  `code` CHAR(3) NOT NULL COMMENT 'ISO 4217',
  `label` VARCHAR(120) NOT NULL,
  `symbol` VARCHAR(16) DEFAULT NULL,
  `decimal_places` TINYINT NOT NULL DEFAULT 2,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_by_user_id` CHAR(36) DEFAULT NULL,
  `updated_by_user_id` CHAR(36) DEFAULT NULL,
  `deleted_by_user_id` CHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `uniq_code` CHAR(3) GENERATED ALWAYS AS (
    CASE WHEN `deleted_at` IS NULL THEN `code` ELSE NULL END
  ) STORED,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_currencies_code` (`uniq_code`),
  KEY `idx_currencies_active_sort` (`is_active`, `sort_order`, `code`),
  KEY `idx_currencies_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_currencies_created_by`
    FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_currencies_updated_by`
    FOREIGN KEY (`updated_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_currencies_deleted_by`
    FOREIGN KEY (`deleted_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed MVP (liste historique Admin)
INSERT IGNORE INTO `currencies` (
  `id`, `code`, `label`, `symbol`, `decimal_places`, `is_active`, `sort_order`
) VALUES
('00000000-0000-4000-8000-000000003001', 'XOF', 'Franc CFA (BCEAO)', 'CFA', 0, 1, 10),
('00000000-0000-4000-8000-000000003002', 'XAF', 'Franc CFA (BEAC)', 'FCFA', 0, 1, 20),
('00000000-0000-4000-8000-000000003003', 'EUR', 'Euro', '€', 2, 1, 30),
('00000000-0000-4000-8000-000000003004', 'USD', 'US Dollar', '$', 2, 1, 40),
('00000000-0000-4000-8000-000000003005', 'MAD', 'Dirham marocain', 'MAD', 2, 1, 50),
('00000000-0000-4000-8000-000000003006', 'GHS', 'Ghanaian cedi', 'GH₵', 2, 1, 60),
('00000000-0000-4000-8000-000000003007', 'NGN', 'Nigerian naira', '₦', 2, 1, 70);

-- Permissions RBAC
INSERT IGNORE INTO `permissions` (`id`, `code`, `resource`, `action`, `description`) VALUES
('00000000-0000-4000-8000-000000001081', 'currencies.read', 'currencies', 'read', 'View platform currencies catalog'),
('00000000-0000-4000-8000-000000001082', 'currencies.write', 'currencies', 'write', 'Manage platform currencies catalog');

-- super_admin: read + write
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`, `granted_by_user_id`)
SELECT r.`id`, p.`id`, u.`id`
FROM `permissions` p
JOIN `roles` r ON r.`id` = '00000000-0000-4000-8000-000000000100'
JOIN `users` u ON u.`id` = '00000000-0000-4000-8000-000000000010'
WHERE p.`id` IN (
  '00000000-0000-4000-8000-000000001081',
  '00000000-0000-4000-8000-000000001082'
);

-- org_admin: read only (sélecteurs formulaires)
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`, `granted_by_user_id`)
SELECT r.`id`, p.`id`, u.`id`
FROM `permissions` p
JOIN `roles` r ON r.`id` = '00000000-0000-4000-8000-000000000101'
JOIN `users` u ON u.`id` = '00000000-0000-4000-8000-000000000010'
WHERE p.`id` = '00000000-0000-4000-8000-000000001081';

-- ---------------------------------------------------------------------------
-- DOWN (manuel — ne pas placer dans un .sql auto-appliqué par db:sync)
-- ---------------------------------------------------------------------------
-- DELETE FROM `role_permissions` WHERE `permission_id` IN (
--   '00000000-0000-4000-8000-000000001081',
--   '00000000-0000-4000-8000-000000001082'
-- );
-- DELETE FROM `permissions` WHERE `id` IN (
--   '00000000-0000-4000-8000-000000001081',
--   '00000000-0000-4000-8000-000000001082'
-- );
-- DROP TABLE IF EXISTS `currencies`;
