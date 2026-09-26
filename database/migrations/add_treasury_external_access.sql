-- TRESO-005 — Collaborateurs externes trésorerie + jetons d’accès sécurisés
-- Ajoute aussi la FK expense_requests.requested_by_external_id (reportée depuis TRESO-003).
-- Traçabilité des actions : via treasury_audit_logs (TRESO-006) — actor_type=external, actor_id=collaborator.id
-- Down (manuel) : voir commentaires en bas de fichier.
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `treasury_external_collaborators` (
  `id` CHAR(36) NOT NULL,
  `organization_id` CHAR(36) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `display_name` VARCHAR(255) DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `scopes` JSON NOT NULL COMMENT 'Ex. ["expense_requests.create"]',
  `created_by_user_id` CHAR(36) DEFAULT NULL,
  `updated_by_user_id` CHAR(36) DEFAULT NULL,
  `deleted_by_user_id` CHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_treasury_external_collaborators_org_email` (`organization_id`, `email`),
  KEY `idx_treasury_external_collaborators_org` (`organization_id`),
  KEY `idx_treasury_external_collaborators_active` (`is_active`),
  KEY `idx_treasury_external_collaborators_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_treasury_external_collaborators_org`
    FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_treasury_external_collaborators_created_by`
    FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_treasury_external_collaborators_updated_by`
    FOREIGN KEY (`updated_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_treasury_external_collaborators_deleted_by`
    FOREIGN KEY (`deleted_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `treasury_access_tokens` (
  `id` CHAR(36) NOT NULL,
  `collaborator_id` CHAR(36) NOT NULL,
  `token_hash` VARCHAR(64) NOT NULL COMMENT 'SHA-256 hex du jeton brut — jamais stocké en clair',
  `expires_at` DATETIME NOT NULL,
  `scopes` JSON DEFAULT NULL COMMENT 'Snapshot à l’émission ; NULL = hérite du collaborateur',
  `revoked_at` DATETIME DEFAULT NULL,
  `last_used_at` DATETIME DEFAULT NULL,
  `created_by_user_id` CHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_treasury_access_tokens_hash` (`token_hash`),
  KEY `idx_treasury_access_tokens_collaborator` (`collaborator_id`),
  KEY `idx_treasury_access_tokens_expires` (`expires_at`),
  KEY `idx_treasury_access_tokens_revoked` (`revoked_at`),
  CONSTRAINT `fk_treasury_access_tokens_collaborator`
    FOREIGN KEY (`collaborator_id`) REFERENCES `treasury_external_collaborators` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_treasury_access_tokens_created_by`
    FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- FK reportée TRESO-003 → externes
SET @fk_exists := (
  SELECT COUNT(*)
  FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'expense_requests'
    AND CONSTRAINT_NAME = 'fk_expense_requests_requested_by_external'
);
SET @sql := IF(
  @fk_exists = 0,
  'ALTER TABLE `expense_requests`
     ADD CONSTRAINT `fk_expense_requests_requested_by_external`
     FOREIGN KEY (`requested_by_external_id`)
     REFERENCES `treasury_external_collaborators` (`id`) ON DELETE SET NULL',
  'SELECT ''fk_expense_requests_requested_by_external already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ---------------------------------------------------------------------------
-- DOWN (manuel — ne pas placer dans un .sql auto-appliqué par db:sync)
-- ---------------------------------------------------------------------------
-- ALTER TABLE `expense_requests` DROP FOREIGN KEY `fk_expense_requests_requested_by_external`;
-- DROP TABLE IF EXISTS `treasury_access_tokens`;
-- DROP TABLE IF EXISTS `treasury_external_collaborators`;
