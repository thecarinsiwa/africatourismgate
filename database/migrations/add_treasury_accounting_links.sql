-- TRESO-039 — Pont comptable stub `accounting_links` (pas de moteur SYSCOHADA)
-- Down (manuel) : voir commentaires en bas de fichier.
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `accounting_links` (
  `id` CHAR(36) NOT NULL,
  `organization_id` CHAR(36) NOT NULL,
  `fund_op_type` ENUM('fund_entry', 'fund_exit') NOT NULL,
  `fund_op_id` CHAR(36) NOT NULL,
  `journal_entry_id` CHAR(36) DEFAULT NULL
    COMMENT 'Rempli par l’épic SYSCOHADA futur — nullable dans ce stub',
  `mapping_rule_key` VARCHAR(120) DEFAULT NULL
    COMMENT 'Clé dans treasury-accounting-mapping.config',
  `status` ENUM('pending', 'linked', 'skipped') NOT NULL DEFAULT 'pending',
  `created_by_user_id` CHAR(36) DEFAULT NULL,
  `updated_by_user_id` CHAR(36) DEFAULT NULL,
  `deleted_by_user_id` CHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_accounting_links_fund_op` (`fund_op_type`, `fund_op_id`),
  KEY `idx_accounting_links_org` (`organization_id`),
  KEY `idx_accounting_links_status` (`status`),
  KEY `idx_accounting_links_journal` (`journal_entry_id`),
  KEY `idx_accounting_links_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_accounting_links_org`
    FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_accounting_links_created_by`
    FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_accounting_links_updated_by`
    FOREIGN KEY (`updated_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_accounting_links_deleted_by`
    FOREIGN KEY (`deleted_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- DOWN (manuel — ne pas placer dans un .sql auto-appliqué par db:sync)
-- ---------------------------------------------------------------------------
-- DROP TABLE IF EXISTS `accounting_links`;
