-- SYSCO-003 — Journaux paramétrables + écritures / lignes (`accounting_journals`, `journal_entries`, `journal_lines`)
-- Numérotation légale : `{journal.code}-{exercise.code}-{entry_seq:05d}` unique par (journal, exercice).
-- Pas de branchement `accounting_links.journal_entry_id` (SYSCO-005).
-- Down (manuel) : voir commentaires en bas de fichier.
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `accounting_journals` (
  `id` CHAR(36) NOT NULL,
  `organization_id` CHAR(36) NOT NULL,
  `code` VARCHAR(20) NOT NULL
    COMMENT 'Ex. CAI, BQ, OD, AC, VE',
  `label` VARCHAR(120) NOT NULL,
  `journal_type` ENUM(
    'cash',
    'bank',
    'purchases',
    'sales',
    'general',
    'other'
  ) NOT NULL,
  `default_account_id` CHAR(36) DEFAULT NULL
    COMMENT 'Compte trésorerie par défaut (caisse/banque)',
  `next_entry_seq` INT NOT NULL DEFAULT 1
    COMMENT 'Compteur indicatif ; séquence réelle = MAX par journal+exercice',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
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
  UNIQUE KEY `uk_accounting_journals_org_code` (`organization_id`, `uniq_code`),
  KEY `idx_accounting_journals_org` (`organization_id`),
  KEY `idx_accounting_journals_type` (`journal_type`),
  KEY `idx_accounting_journals_active` (`is_active`),
  KEY `idx_accounting_journals_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_accounting_journals_org`
    FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_accounting_journals_default_account`
    FOREIGN KEY (`default_account_id`) REFERENCES `chart_of_accounts` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_accounting_journals_created_by`
    FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_accounting_journals_updated_by`
    FOREIGN KEY (`updated_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_accounting_journals_deleted_by`
    FOREIGN KEY (`deleted_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `journal_entries` (
  `id` CHAR(36) NOT NULL,
  `organization_id` CHAR(36) NOT NULL,
  `journal_id` CHAR(36) NOT NULL,
  `exercise_id` CHAR(36) NOT NULL,
  `period_id` CHAR(36) NOT NULL,
  `entry_number` VARCHAR(40) NOT NULL
    COMMENT 'Numéro légal affiché (ex. CAI-2026-00042)',
  `entry_seq` INT NOT NULL
    COMMENT 'Séquence monotone par journal+exercice',
  `entry_date` DATE NOT NULL,
  `description` VARCHAR(500) NOT NULL,
  `status` ENUM('draft', 'posted', 'reversed') NOT NULL DEFAULT 'draft',
  `source` ENUM(
    'treasury_mapping',
    'manual',
    'closing',
    'reversal'
  ) NOT NULL DEFAULT 'manual',
  `reverses_entry_id` CHAR(36) DEFAULT NULL,
  `posted_at` DATETIME DEFAULT NULL,
  `posted_by_user_id` CHAR(36) DEFAULT NULL,
  `currency` CHAR(3) NOT NULL
    COMMENT 'Devise de tenue (= exercice)',
  `created_by_user_id` CHAR(36) DEFAULT NULL,
  `updated_by_user_id` CHAR(36) DEFAULT NULL,
  `deleted_by_user_id` CHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL
    COMMENT 'Autorisé surtout pour draft ; posted = contrepassation',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_journal_entries_journal_exercise_seq` (`journal_id`, `exercise_id`, `entry_seq`),
  UNIQUE KEY `uk_journal_entries_entry_number_org` (`organization_id`, `entry_number`),
  KEY `idx_journal_entries_org` (`organization_id`),
  KEY `idx_journal_entries_journal` (`journal_id`),
  KEY `idx_journal_entries_exercise` (`exercise_id`),
  KEY `idx_journal_entries_period` (`period_id`),
  KEY `idx_journal_entries_date` (`entry_date`),
  KEY `idx_journal_entries_status` (`status`),
  KEY `idx_journal_entries_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_journal_entries_org`
    FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_journal_entries_journal`
    FOREIGN KEY (`journal_id`) REFERENCES `accounting_journals` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_journal_entries_exercise`
    FOREIGN KEY (`exercise_id`) REFERENCES `accounting_exercises` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_journal_entries_period`
    FOREIGN KEY (`period_id`) REFERENCES `accounting_periods` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_journal_entries_reverses`
    FOREIGN KEY (`reverses_entry_id`) REFERENCES `journal_entries` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_journal_entries_posted_by`
    FOREIGN KEY (`posted_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_journal_entries_created_by`
    FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_journal_entries_updated_by`
    FOREIGN KEY (`updated_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_journal_entries_deleted_by`
    FOREIGN KEY (`deleted_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `journal_lines` (
  `id` CHAR(36) NOT NULL,
  `journal_entry_id` CHAR(36) NOT NULL,
  `organization_id` CHAR(36) NOT NULL,
  `line_no` SMALLINT NOT NULL,
  `account_id` CHAR(36) NOT NULL,
  `label` VARCHAR(255) DEFAULT NULL,
  `debit_cents` INT NOT NULL DEFAULT 0,
  `credit_cents` INT NOT NULL DEFAULT 0,
  `original_amount_cents` INT DEFAULT NULL,
  `original_currency` CHAR(3) DEFAULT NULL,
  `fx_rate` DECIMAL(18, 8) DEFAULT NULL,
  `analytic_ref_type` VARCHAR(40) DEFAULT NULL
    COMMENT 'Optionnel : booking, activity, …',
  `analytic_ref_id` CHAR(36) DEFAULT NULL,
  `created_by_user_id` CHAR(36) DEFAULT NULL,
  `updated_by_user_id` CHAR(36) DEFAULT NULL,
  `deleted_by_user_id` CHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_journal_lines_entry_line_no` (`journal_entry_id`, `line_no`),
  KEY `idx_journal_lines_org` (`organization_id`),
  KEY `idx_journal_lines_account` (`account_id`),
  KEY `idx_journal_lines_analytic` (`analytic_ref_type`, `analytic_ref_id`),
  KEY `idx_journal_lines_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_journal_lines_entry`
    FOREIGN KEY (`journal_entry_id`) REFERENCES `journal_entries` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_journal_lines_org`
    FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_journal_lines_account`
    FOREIGN KEY (`account_id`) REFERENCES `chart_of_accounts` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_journal_lines_created_by`
    FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_journal_lines_updated_by`
    FOREIGN KEY (`updated_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_journal_lines_deleted_by`
    FOREIGN KEY (`deleted_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `chk_journal_lines_amounts_nonneg`
    CHECK (`debit_cents` >= 0 AND `credit_cents` >= 0),
  CONSTRAINT `chk_journal_lines_one_side`
    CHECK (
      (`debit_cents` > 0 AND `credit_cents` = 0)
      OR (`credit_cents` > 0 AND `debit_cents` = 0)
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Seed journaux plateforme (CAI / BQ / OD / AC / VE)
-- IDs : 00000000-0000-4000-8000-00000000220x
-- Comptes défaut : 57 (caisse), 521 (banque) — seed SYSCO-002
-- ---------------------------------------------------------------------------

INSERT IGNORE INTO `accounting_journals` (
  `id`, `organization_id`, `code`, `label`, `journal_type`,
  `default_account_id`, `next_entry_seq`, `is_active`
)
SELECT
  '00000000-0000-4000-8000-000000002201',
  o.`id`,
  'CAI',
  'Journal de caisse',
  'cash',
  '00000000-0000-4000-8000-000000002001',
  1,
  1
FROM `organizations` o
WHERE o.`id` = '00000000-0000-4000-8000-000000000001'
  AND EXISTS (
    SELECT 1 FROM `chart_of_accounts` a
    WHERE a.`id` = '00000000-0000-4000-8000-000000002001'
  );

INSERT IGNORE INTO `accounting_journals` (
  `id`, `organization_id`, `code`, `label`, `journal_type`,
  `default_account_id`, `next_entry_seq`, `is_active`
)
SELECT
  '00000000-0000-4000-8000-000000002202',
  o.`id`,
  'BQ',
  'Journal de banque',
  'bank',
  '00000000-0000-4000-8000-000000002002',
  1,
  1
FROM `organizations` o
WHERE o.`id` = '00000000-0000-4000-8000-000000000001'
  AND EXISTS (
    SELECT 1 FROM `chart_of_accounts` a
    WHERE a.`id` = '00000000-0000-4000-8000-000000002002'
  );

INSERT IGNORE INTO `accounting_journals` (
  `id`, `organization_id`, `code`, `label`, `journal_type`,
  `default_account_id`, `next_entry_seq`, `is_active`
)
SELECT
  '00000000-0000-4000-8000-000000002203',
  o.`id`,
  'OD',
  'Opérations diverses',
  'general',
  NULL,
  1,
  1
FROM `organizations` o
WHERE o.`id` = '00000000-0000-4000-8000-000000000001';

INSERT IGNORE INTO `accounting_journals` (
  `id`, `organization_id`, `code`, `label`, `journal_type`,
  `default_account_id`, `next_entry_seq`, `is_active`
)
SELECT
  '00000000-0000-4000-8000-000000002204',
  o.`id`,
  'AC',
  'Journal des achats',
  'purchases',
  NULL,
  1,
  1
FROM `organizations` o
WHERE o.`id` = '00000000-0000-4000-8000-000000000001';

INSERT IGNORE INTO `accounting_journals` (
  `id`, `organization_id`, `code`, `label`, `journal_type`,
  `default_account_id`, `next_entry_seq`, `is_active`
)
SELECT
  '00000000-0000-4000-8000-000000002205',
  o.`id`,
  'VE',
  'Journal des ventes',
  'sales',
  NULL,
  1,
  1
FROM `organizations` o
WHERE o.`id` = '00000000-0000-4000-8000-000000000001';

-- ---------------------------------------------------------------------------
-- DOWN (manuel — ne pas placer dans un .sql auto-appliqué par db:sync)
-- ---------------------------------------------------------------------------
-- DROP TABLE IF EXISTS `journal_lines`;
-- DROP TABLE IF EXISTS `journal_entries`;
-- DELETE FROM `accounting_journals` WHERE `id` LIKE '00000000-0000-4000-8000-00000000220%';
-- DROP TABLE IF EXISTS `accounting_journals`;
