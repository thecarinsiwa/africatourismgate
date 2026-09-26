-- TRESO-006 — Journal d’audit trésorerie (append-only)
-- Pattern inspiré de rbac_audit_logs ; table dédiée pour entity_type / old/new JSON métier.
-- Pas de updated_at / deleted_at : historique non modifiable côté schéma applicatif.
-- Down (manuel) : voir commentaires en bas de fichier.
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `treasury_audit_logs` (
  `id` CHAR(36) NOT NULL,
  `organization_id` CHAR(36) NOT NULL,
  `entity_type` ENUM(
    'fund_entry',
    'fund_exit',
    'expense_request',
    'budget',
    'external_collaborator',
    'access_token',
    'accounting_link'
  ) NOT NULL,
  `entity_id` CHAR(36) NOT NULL,
  `action` ENUM(
    'create',
    'update',
    'transition',
    'void',
    'attach',
    'detach',
    'invite',
    'activate',
    'deactivate',
    'revoke_token'
  ) NOT NULL,
  `actor_type` ENUM('user', 'external', 'system') NOT NULL DEFAULT 'user',
  `actor_id` CHAR(36) DEFAULT NULL,
  `old_json` JSON DEFAULT NULL,
  `new_json` JSON DEFAULT NULL,
  `correlation_id` CHAR(36) DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `user_agent` VARCHAR(512) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_treasury_audit_logs_entity` (`entity_type`, `entity_id`),
  KEY `idx_treasury_audit_logs_created_at` (`created_at`),
  KEY `idx_treasury_audit_logs_org_created` (`organization_id`, `created_at`),
  KEY `idx_treasury_audit_logs_actor` (`actor_type`, `actor_id`),
  KEY `idx_treasury_audit_logs_action` (`action`),
  CONSTRAINT `fk_treasury_audit_logs_org`
    FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- DOWN (manuel — ne pas placer dans un .sql auto-appliqué par db:sync)
-- ---------------------------------------------------------------------------
-- DROP TABLE IF EXISTS `treasury_audit_logs`;
