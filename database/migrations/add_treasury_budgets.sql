-- TRESO-004 — Budgets mensuels / annuels, par activité ou produit/service
-- Down (manuel) : voir commentaires en bas de fichier.
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `budgets` (
  `id` CHAR(36) NOT NULL,
  `organization_id` CHAR(36) NOT NULL,
  `label` VARCHAR(255) NOT NULL,
  `period_type` ENUM('monthly', 'annual') NOT NULL,
  `year` SMALLINT NOT NULL,
  `month` TINYINT DEFAULT NULL COMMENT '1-12 si period_type=monthly ; NULL si annual',
  `amount_cents` INT NOT NULL,
  `currency` CHAR(3) NOT NULL,
  `scope_type` ENUM('general', 'activity', 'product') NOT NULL DEFAULT 'general',
  `activity_id` CHAR(36) DEFAULT NULL,
  `product_type` ENUM(
    'room',
    'flight_class',
    'vehicle',
    'cabin',
    'activity_schedule',
    'package'
  ) DEFAULT NULL,
  `product_id` CHAR(36) DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_by_user_id` CHAR(36) DEFAULT NULL,
  `updated_by_user_id` CHAR(36) DEFAULT NULL,
  `deleted_by_user_id` CHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_budgets_org` (`organization_id`),
  KEY `idx_budgets_period` (`period_type`, `year`, `month`),
  KEY `idx_budgets_scope_type` (`scope_type`),
  KEY `idx_budgets_activity` (`activity_id`),
  KEY `idx_budgets_product` (`product_type`, `product_id`),
  KEY `idx_budgets_currency` (`currency`),
  KEY `idx_budgets_deleted_at` (`deleted_at`),
  UNIQUE KEY `uk_budgets_scope` (
    `organization_id`,
    `period_type`,
    `year`,
    `month`,
    `scope_type`,
    `activity_id`,
    `product_type`,
    `product_id`,
    `currency`
  ),
  CONSTRAINT `fk_budgets_org`
    FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_budgets_activity`
    FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_budgets_created_by`
    FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_budgets_updated_by`
    FOREIGN KEY (`updated_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_budgets_deleted_by`
    FOREIGN KEY (`deleted_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- DOWN (manuel — ne pas placer dans un .sql auto-appliqué par db:sync)
-- ---------------------------------------------------------------------------
-- DROP TABLE IF EXISTS `budgets`;
