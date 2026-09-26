-- SYSCO-002 — Exercices / périodes comptables (`accounting_exercises`, `accounting_periods`)
-- Seed exercice 2026 + 12 périodes mensuelles pour l’org plateforme.
-- Down (manuel) : voir commentaires en bas de fichier.
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `accounting_exercises` (
  `id` CHAR(36) NOT NULL,
  `organization_id` CHAR(36) NOT NULL,
  `code` VARCHAR(20) NOT NULL
    COMMENT 'Ex. 2026',
  `label` VARCHAR(120) NOT NULL,
  `starts_on` DATE NOT NULL,
  `ends_on` DATE NOT NULL,
  `currency` CHAR(3) NOT NULL
    COMMENT 'Devise de tenue de l’exercice',
  `status` ENUM('open', 'closing', 'closed') NOT NULL DEFAULT 'open',
  `closed_at` DATETIME DEFAULT NULL,
  `closed_by_user_id` CHAR(36) DEFAULT NULL,
  `created_by_user_id` CHAR(36) DEFAULT NULL,
  `updated_by_user_id` CHAR(36) DEFAULT NULL,
  `deleted_by_user_id` CHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `uniq_code` VARCHAR(20) GENERATED ALWAYS AS (
    CASE WHEN `deleted_at` IS NULL THEN `code` ELSE NULL END
  ) STORED,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_accounting_exercises_org_code` (`organization_id`, `uniq_code`),
  KEY `idx_accounting_exercises_org` (`organization_id`),
  KEY `idx_accounting_exercises_status` (`status`),
  KEY `idx_accounting_exercises_dates` (`starts_on`, `ends_on`),
  KEY `idx_accounting_exercises_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_accounting_exercises_org`
    FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_accounting_exercises_closed_by`
    FOREIGN KEY (`closed_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_accounting_exercises_created_by`
    FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_accounting_exercises_updated_by`
    FOREIGN KEY (`updated_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_accounting_exercises_deleted_by`
    FOREIGN KEY (`deleted_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `accounting_periods` (
  `id` CHAR(36) NOT NULL,
  `exercise_id` CHAR(36) NOT NULL,
  `organization_id` CHAR(36) NOT NULL
    COMMENT 'Dénormalisé pour filtres',
  `code` VARCHAR(20) NOT NULL
    COMMENT 'Ex. 2026-01',
  `starts_on` DATE NOT NULL,
  `ends_on` DATE NOT NULL,
  `status` ENUM('open', 'locked', 'closed') NOT NULL DEFAULT 'open',
  `sequence_no` SMALLINT NOT NULL
    COMMENT 'Ordre dans l’exercice (1–12 typique)',
  `created_by_user_id` CHAR(36) DEFAULT NULL,
  `updated_by_user_id` CHAR(36) DEFAULT NULL,
  `deleted_by_user_id` CHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `uniq_code` VARCHAR(20) GENERATED ALWAYS AS (
    CASE WHEN `deleted_at` IS NULL THEN `code` ELSE NULL END
  ) STORED,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_accounting_periods_exercise_code` (`exercise_id`, `uniq_code`),
  UNIQUE KEY `uk_accounting_periods_exercise_seq` (`exercise_id`, `sequence_no`),
  KEY `idx_accounting_periods_org` (`organization_id`),
  KEY `idx_accounting_periods_status` (`status`),
  KEY `idx_accounting_periods_dates` (`starts_on`, `ends_on`),
  KEY `idx_accounting_periods_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_accounting_periods_exercise`
    FOREIGN KEY (`exercise_id`) REFERENCES `accounting_exercises` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_accounting_periods_org`
    FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_accounting_periods_created_by`
    FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_accounting_periods_updated_by`
    FOREIGN KEY (`updated_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_accounting_periods_deleted_by`
    FOREIGN KEY (`deleted_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Seed exercice 2026 (devise = currency org plateforme)
-- ---------------------------------------------------------------------------

INSERT IGNORE INTO `accounting_exercises` (
  `id`, `organization_id`, `code`, `label`,
  `starts_on`, `ends_on`, `currency`, `status`
)
SELECT
  '00000000-0000-4000-8000-000000002100',
  o.`id`,
  '2026',
  'Exercice 2026',
  '2026-01-01',
  '2026-12-31',
  UPPER(LEFT(COALESCE(NULLIF(TRIM(o.`currency`), ''), 'XOF'), 3)),
  'open'
FROM `organizations` o
WHERE o.`id` = '00000000-0000-4000-8000-000000000001';

INSERT IGNORE INTO `accounting_periods` (
  `id`, `exercise_id`, `organization_id`, `code`,
  `starts_on`, `ends_on`, `status`, `sequence_no`
)
SELECT
  CONCAT('00000000-0000-4000-8000-0000000021', LPAD(m.seq, 2, '0')),
  '00000000-0000-4000-8000-000000002100',
  '00000000-0000-4000-8000-000000000001',
  CONCAT('2026-', LPAD(m.seq, 2, '0')),
  DATE(CONCAT('2026-', LPAD(m.seq, 2, '0'), '-01')),
  LAST_DAY(DATE(CONCAT('2026-', LPAD(m.seq, 2, '0'), '-01'))),
  'open',
  m.seq
FROM (
  SELECT 1 AS seq UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
  UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8
  UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12
) AS m
WHERE EXISTS (
  SELECT 1 FROM `accounting_exercises` e
  WHERE e.`id` = '00000000-0000-4000-8000-000000002100'
);

-- ---------------------------------------------------------------------------
-- DOWN (manuel — ne pas placer dans un .sql auto-appliqué par db:sync)
-- ---------------------------------------------------------------------------
-- DELETE FROM `accounting_periods` WHERE `exercise_id` = '00000000-0000-4000-8000-000000002100';
-- DELETE FROM `accounting_exercises` WHERE `id` = '00000000-0000-4000-8000-000000002100';
-- DROP TABLE IF EXISTS `accounting_periods`;
-- DROP TABLE IF EXISTS `accounting_exercises`;
