-- SYSCO-009 — Journal d’audit écritures SYSCOHADA (`accounting_audit_logs`)
-- Append-only ; corrélation optionnelle avec `treasury_audit_logs`.
-- Down (manuel) : DROP TABLE IF EXISTS `accounting_audit_logs`;
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `accounting_audit_logs` (
  `id` CHAR(36) NOT NULL,
  `organization_id` CHAR(36) NOT NULL,
  `entity_type` ENUM(
    'journal_entry',
    'journal_line',
    'chart_account',
    'exercise',
    'period',
    'mapping_rule',
    'accounting_link',
    'journal'
  ) NOT NULL,
  `entity_id` CHAR(36) NOT NULL,
  `action` ENUM(
    'create',
    'update',
    'post',
    'reverse',
    'lock',
    'unlock',
    'close',
    'skip',
    'delete'
  ) NOT NULL,
  `actor_type` ENUM('user', 'system') NOT NULL DEFAULT 'user',
  `actor_id` CHAR(36) DEFAULT NULL,
  `old_json` JSON DEFAULT NULL,
  `new_json` JSON DEFAULT NULL,
  `correlation_treasury_audit_id` CHAR(36) DEFAULT NULL
    COMMENT 'Lien optionnel vers treasury_audit_logs.id',
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `user_agent` VARCHAR(512) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_accounting_audit_logs_entity` (`entity_type`, `entity_id`),
  KEY `idx_accounting_audit_logs_created_at` (`created_at`),
  KEY `idx_accounting_audit_logs_org_created` (`organization_id`, `created_at`),
  KEY `idx_accounting_audit_logs_actor` (`actor_type`, `actor_id`),
  KEY `idx_accounting_audit_logs_action` (`action`),
  KEY `idx_accounting_audit_logs_treasury_corr` (`correlation_treasury_audit_id`),
  CONSTRAINT `fk_accounting_audit_logs_org`
    FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
