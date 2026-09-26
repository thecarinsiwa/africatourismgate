-- SYSCO-002 — Plan comptable SYSCOHADA multi-org (`chart_of_accounts`)
-- Seed minimal classes 4–7 utiles trésorerie (placeholders validés jusqu’à revue finance).
-- Down (manuel) : voir commentaires en bas de fichier.
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `chart_of_accounts` (
  `id` CHAR(36) NOT NULL,
  `organization_id` CHAR(36) NOT NULL,
  `code` VARCHAR(20) NOT NULL
    COMMENT 'Code compte local (ex. 57, 521, 701)',
  `label` VARCHAR(255) NOT NULL,
  `class_number` TINYINT NOT NULL
    COMMENT 'Classe SYSCOHADA 1–8',
  `account_type` ENUM(
    'equity',
    'fixed_asset',
    'inventory',
    'third_party',
    'treasury',
    'expense',
    'revenue',
    'special'
  ) NOT NULL,
  `parent_id` CHAR(36) DEFAULT NULL,
  `is_postable` TINYINT(1) NOT NULL DEFAULT 1
    COMMENT '0 = compte de regroupement',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `syscohada_ref` VARCHAR(20) DEFAULT NULL
    COMMENT 'Code référentiel officiel si distinct du code local',
  `created_by_user_id` CHAR(36) DEFAULT NULL,
  `updated_by_user_id` CHAR(36) DEFAULT NULL,
  `deleted_by_user_id` CHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  -- Unicité (org, code) parmi les lignes non soft-deleted (NULL autorisé en multiple)
  `uniq_code` VARCHAR(20) GENERATED ALWAYS AS (
    CASE WHEN `deleted_at` IS NULL THEN `code` ELSE NULL END
  ) STORED,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_chart_of_accounts_org_code` (`organization_id`, `uniq_code`),
  KEY `idx_chart_of_accounts_org` (`organization_id`),
  KEY `idx_chart_of_accounts_class` (`class_number`),
  KEY `idx_chart_of_accounts_type` (`account_type`),
  KEY `idx_chart_of_accounts_parent` (`parent_id`),
  KEY `idx_chart_of_accounts_active` (`is_active`),
  KEY `idx_chart_of_accounts_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_chart_of_accounts_org`
    FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_chart_of_accounts_parent`
    FOREIGN KEY (`parent_id`) REFERENCES `chart_of_accounts` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_chart_of_accounts_created_by`
    FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_chart_of_accounts_updated_by`
    FOREIGN KEY (`updated_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_chart_of_accounts_deleted_by`
    FOREIGN KEY (`deleted_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `chk_chart_of_accounts_class`
    CHECK (`class_number` BETWEEN 1 AND 8)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Seed plateforme (org Africa Tourism Gate) — aligné hints stub TRESO-039
-- IDs stables : 00000000-0000-4000-8000-0000000020xx
-- ---------------------------------------------------------------------------

INSERT IGNORE INTO `chart_of_accounts` (
  `id`, `organization_id`, `code`, `label`, `class_number`, `account_type`,
  `parent_id`, `is_postable`, `is_active`, `syscohada_ref`
)
SELECT
  '00000000-0000-4000-8000-000000002001',
  o.`id`,
  '57',
  'Caisse',
  5,
  'treasury',
  NULL,
  1,
  1,
  '57'
FROM `organizations` o
WHERE o.`id` = '00000000-0000-4000-8000-000000000001';

INSERT IGNORE INTO `chart_of_accounts` (
  `id`, `organization_id`, `code`, `label`, `class_number`, `account_type`,
  `parent_id`, `is_postable`, `is_active`, `syscohada_ref`
)
SELECT
  '00000000-0000-4000-8000-000000002002',
  o.`id`,
  '521',
  'Banques locales',
  5,
  'treasury',
  NULL,
  1,
  1,
  '521'
FROM `organizations` o
WHERE o.`id` = '00000000-0000-4000-8000-000000000001';

INSERT IGNORE INTO `chart_of_accounts` (
  `id`, `organization_id`, `code`, `label`, `class_number`, `account_type`,
  `parent_id`, `is_postable`, `is_active`, `syscohada_ref`
)
SELECT
  '00000000-0000-4000-8000-000000002003',
  o.`id`,
  '538',
  'Mobile money et assimilés',
  5,
  'treasury',
  NULL,
  1,
  1,
  '538'
FROM `organizations` o
WHERE o.`id` = '00000000-0000-4000-8000-000000000001';

INSERT IGNORE INTO `chart_of_accounts` (
  `id`, `organization_id`, `code`, `label`, `class_number`, `account_type`,
  `parent_id`, `is_postable`, `is_active`, `syscohada_ref`
)
SELECT
  '00000000-0000-4000-8000-000000002004',
  o.`id`,
  '411',
  'Clients',
  4,
  'third_party',
  NULL,
  1,
  1,
  '411'
FROM `organizations` o
WHERE o.`id` = '00000000-0000-4000-8000-000000000001';

INSERT IGNORE INTO `chart_of_accounts` (
  `id`, `organization_id`, `code`, `label`, `class_number`, `account_type`,
  `parent_id`, `is_postable`, `is_active`, `syscohada_ref`
)
SELECT
  '00000000-0000-4000-8000-000000002005',
  o.`id`,
  '60',
  'Achats et variations de stocks',
  6,
  'expense',
  NULL,
  1,
  1,
  '60'
FROM `organizations` o
WHERE o.`id` = '00000000-0000-4000-8000-000000000001';

INSERT IGNORE INTO `chart_of_accounts` (
  `id`, `organization_id`, `code`, `label`, `class_number`, `account_type`,
  `parent_id`, `is_postable`, `is_active`, `syscohada_ref`
)
SELECT
  '00000000-0000-4000-8000-000000002006',
  o.`id`,
  '61',
  'Services extérieurs',
  6,
  'expense',
  NULL,
  1,
  1,
  '61'
FROM `organizations` o
WHERE o.`id` = '00000000-0000-4000-8000-000000000001';

INSERT IGNORE INTO `chart_of_accounts` (
  `id`, `organization_id`, `code`, `label`, `class_number`, `account_type`,
  `parent_id`, `is_postable`, `is_active`, `syscohada_ref`
)
SELECT
  '00000000-0000-4000-8000-000000002007',
  o.`id`,
  '70',
  'Ventes',
  7,
  'revenue',
  NULL,
  1,
  1,
  '70'
FROM `organizations` o
WHERE o.`id` = '00000000-0000-4000-8000-000000000001';

-- ---------------------------------------------------------------------------
-- DOWN (manuel — ne pas placer dans un .sql auto-appliqué par db:sync)
-- ---------------------------------------------------------------------------
-- DELETE FROM `chart_of_accounts` WHERE `id` LIKE '00000000-0000-4000-8000-00000000200%';
-- DROP TABLE IF EXISTS `chart_of_accounts`;
