-- Taux de change manuels (MVP) — conversion à la comptabilisation SYSCOHADA
-- Down (manuel) : voir commentaires en bas de fichier.
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `exchange_rates` (
  `id` CHAR(36) NOT NULL,
  `organization_id` CHAR(36) NOT NULL,
  `from_currency` CHAR(3) NOT NULL COMMENT 'Devise source (ex. op fund_*)',
  `to_currency` CHAR(3) NOT NULL COMMENT 'Devise cible (ex. tenue exercice)',
  `rate` DECIMAL(18, 8) NOT NULL COMMENT '1 from = rate to',
  `effective_on` DATE NOT NULL COMMENT 'Taux applicable à partir de cette date',
  `notes` VARCHAR(500) DEFAULT NULL,
  `created_by_user_id` CHAR(36) DEFAULT NULL,
  `updated_by_user_id` CHAR(36) DEFAULT NULL,
  `deleted_by_user_id` CHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_exchange_rates_pair_date` (
    `organization_id`,
    `from_currency`,
    `to_currency`,
    `effective_on`
  ),
  KEY `idx_exchange_rates_lookup` (
    `organization_id`,
    `from_currency`,
    `to_currency`,
    `effective_on`
  ),
  KEY `idx_exchange_rates_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_exchange_rates_org`
    FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_exchange_rates_created_by`
    FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_exchange_rates_updated_by`
    FOREIGN KEY (`updated_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_exchange_rates_deleted_by`
    FOREIGN KEY (`deleted_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Permissions RBAC
INSERT IGNORE INTO `permissions` (`id`, `code`, `resource`, `action`, `description`) VALUES
('00000000-0000-4000-8000-000000001079', 'treasury.fx_rates.read', 'treasury', 'fx_rates.read', 'View exchange rates catalog'),
('00000000-0000-4000-8000-000000001080', 'treasury.fx_rates.write', 'treasury', 'fx_rates.write', 'Manage exchange rates catalog');

-- super_admin + org_admin
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`, `granted_by_user_id`)
SELECT r.`id`, p.`id`, u.`id`
FROM `permissions` p
JOIN `roles` r ON r.`id` IN (
  '00000000-0000-4000-8000-000000000100',
  '00000000-0000-4000-8000-000000000101'
)
JOIN `users` u ON u.`id` = '00000000-0000-4000-8000-000000000010'
WHERE p.`id` IN (
  '00000000-0000-4000-8000-000000001079',
  '00000000-0000-4000-8000-000000001080'
);

-- ---------------------------------------------------------------------------
-- DOWN (manuel — ne pas placer dans un .sql auto-appliqué par db:sync)
-- ---------------------------------------------------------------------------
-- DELETE FROM `role_permissions` WHERE `permission_id` IN (
--   '00000000-0000-4000-8000-000000001079',
--   '00000000-0000-4000-8000-000000001080'
-- );
-- DELETE FROM `permissions` WHERE `id` IN (
--   '00000000-0000-4000-8000-000000001079',
--   '00000000-0000-4000-8000-000000001080'
-- );
-- DROP TABLE IF EXISTS `exchange_rates`;
