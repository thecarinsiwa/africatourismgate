-- SYSCO-004 — Référentiel mapping trésorerie → comptes SYSCOHADA (`accounting_mapping_rules`)
-- Remplace le skeleton in-process TREASURY_ACCOUNTING_MAPPING_CONFIG (stub: true).
-- Down (manuel) : voir commentaires en bas de fichier.
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `accounting_mapping_rules` (
  `id` CHAR(36) NOT NULL,
  `organization_id` CHAR(36) NOT NULL,
  `key` VARCHAR(120) NOT NULL
    COMMENT 'Clé stable (ex. fund_entry.booking_payment)',
  `version` INT NOT NULL DEFAULT 1,
  `fund_op_type` ENUM('fund_entry', 'fund_exit') NOT NULL,
  `match_source` VARCHAR(40) DEFAULT NULL
    COMMENT 'FundEntrySource ou NULL = wildcard',
  `match_payment_method` VARCHAR(40) DEFAULT NULL
    COMMENT 'TreasuryPaymentMethod ou NULL = wildcard',
  `journal_id` CHAR(36) NOT NULL,
  `debit_account_id` CHAR(36) NOT NULL,
  `credit_account_id` CHAR(36) NOT NULL,
  `priority` INT NOT NULL DEFAULT 0
    COMMENT 'Plus haut = plus spécifique (après score match)',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `label` VARCHAR(255) NOT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_by_user_id` CHAR(36) DEFAULT NULL,
  `updated_by_user_id` CHAR(36) DEFAULT NULL,
  `deleted_by_user_id` CHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_accounting_mapping_rules_org_key_ver` (`organization_id`, `key`, `version`),
  KEY `idx_accounting_mapping_rules_org_type` (`organization_id`, `fund_op_type`),
  KEY `idx_accounting_mapping_rules_active` (`is_active`),
  KEY `idx_accounting_mapping_rules_journal` (`journal_id`),
  KEY `idx_accounting_mapping_rules_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_accounting_mapping_rules_org`
    FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_accounting_mapping_rules_journal`
    FOREIGN KEY (`journal_id`) REFERENCES `accounting_journals` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_accounting_mapping_rules_debit`
    FOREIGN KEY (`debit_account_id`) REFERENCES `chart_of_accounts` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_accounting_mapping_rules_credit`
    FOREIGN KEY (`credit_account_id`) REFERENCES `chart_of_accounts` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_accounting_mapping_rules_created_by`
    FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_accounting_mapping_rules_updated_by`
    FOREIGN KEY (`updated_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_accounting_mapping_rules_deleted_by`
    FOREIGN KEY (`deleted_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Seed plateforme — IDs 00000000-0000-4000-8000-00000000240x
-- Comptes : 57/521/538/411/60/61/70 · Journaux : CAI/BQ/OD
-- ---------------------------------------------------------------------------

-- Entrée cash → Caisse / Ventes / journal CAI
INSERT IGNORE INTO `accounting_mapping_rules` (
  `id`, `organization_id`, `key`, `version`, `fund_op_type`,
  `match_source`, `match_payment_method`,
  `journal_id`, `debit_account_id`, `credit_account_id`,
  `priority`, `is_active`, `label`, `notes`
)
SELECT
  '00000000-0000-4000-8000-000000002401',
  '00000000-0000-4000-8000-000000000001',
  'fund_entry.cash',
  1,
  'fund_entry',
  NULL,
  'cash',
  '00000000-0000-4000-8000-000000002201',
  '00000000-0000-4000-8000-000000002001',
  '00000000-0000-4000-8000-000000002007',
  20,
  1,
  'Entrée de fonds — espèces',
  'Débit 57 Caisse / crédit 70 Ventes'
WHERE EXISTS (SELECT 1 FROM `accounting_journals` WHERE `id` = '00000000-0000-4000-8000-000000002201');

-- Entrée virement / chèque / stripe → Banque / Ventes / BQ
INSERT IGNORE INTO `accounting_mapping_rules` (
  `id`, `organization_id`, `key`, `version`, `fund_op_type`,
  `match_source`, `match_payment_method`,
  `journal_id`, `debit_account_id`, `credit_account_id`,
  `priority`, `is_active`, `label`, `notes`
)
SELECT
  '00000000-0000-4000-8000-000000002402',
  '00000000-0000-4000-8000-000000000001',
  'fund_entry.bank_transfer',
  1,
  'fund_entry',
  NULL,
  'bank_transfer',
  '00000000-0000-4000-8000-000000002202',
  '00000000-0000-4000-8000-000000002002',
  '00000000-0000-4000-8000-000000002007',
  20,
  1,
  'Entrée de fonds — virement',
  'Débit 521 Banques / crédit 70'
WHERE EXISTS (SELECT 1 FROM `accounting_journals` WHERE `id` = '00000000-0000-4000-8000-000000002202');

INSERT IGNORE INTO `accounting_mapping_rules` (
  `id`, `organization_id`, `key`, `version`, `fund_op_type`,
  `match_source`, `match_payment_method`,
  `journal_id`, `debit_account_id`, `credit_account_id`,
  `priority`, `is_active`, `label`, `notes`
) VALUES (
  '00000000-0000-4000-8000-000000002403',
  '00000000-0000-4000-8000-000000000001',
  'fund_entry.mobile_money',
  1,
  'fund_entry',
  NULL,
  'mobile_money',
  '00000000-0000-4000-8000-000000002202',
  '00000000-0000-4000-8000-000000002003',
  '00000000-0000-4000-8000-000000002007',
  20,
  1,
  'Entrée de fonds — mobile money',
  'Débit 538 / crédit 70'
);

-- Entrée liée réservation → trésorerie générique / Clients
INSERT IGNORE INTO `accounting_mapping_rules` (
  `id`, `organization_id`, `key`, `version`, `fund_op_type`,
  `match_source`, `match_payment_method`,
  `journal_id`, `debit_account_id`, `credit_account_id`,
  `priority`, `is_active`, `label`, `notes`
) VALUES (
  '00000000-0000-4000-8000-000000002404',
  '00000000-0000-4000-8000-000000000001',
  'fund_entry.booking_payment',
  1,
  'fund_entry',
  'booking_payment',
  NULL,
  '00000000-0000-4000-8000-000000002203',
  '00000000-0000-4000-8000-000000002001',
  '00000000-0000-4000-8000-000000002004',
  30,
  1,
  'Entrée liée paiement réservation',
  'Débit 57 / crédit 411 Clients (collectif)'
);

-- Entrée défaut (wildcard)
INSERT IGNORE INTO `accounting_mapping_rules` (
  `id`, `organization_id`, `key`, `version`, `fund_op_type`,
  `match_source`, `match_payment_method`,
  `journal_id`, `debit_account_id`, `credit_account_id`,
  `priority`, `is_active`, `label`, `notes`
) VALUES (
  '00000000-0000-4000-8000-000000002405',
  '00000000-0000-4000-8000-000000000001',
  'fund_entry.default',
  1,
  'fund_entry',
  NULL,
  NULL,
  '00000000-0000-4000-8000-000000002203',
  '00000000-0000-4000-8000-000000002001',
  '00000000-0000-4000-8000-000000002007',
  1,
  1,
  'Entrée de fonds — mapping par défaut',
  'Fallback wildcard'
);

-- Sortie cash → charges / caisse
INSERT IGNORE INTO `accounting_mapping_rules` (
  `id`, `organization_id`, `key`, `version`, `fund_op_type`,
  `match_source`, `match_payment_method`,
  `journal_id`, `debit_account_id`, `credit_account_id`,
  `priority`, `is_active`, `label`, `notes`
) VALUES (
  '00000000-0000-4000-8000-000000002406',
  '00000000-0000-4000-8000-000000000001',
  'fund_exit.cash',
  1,
  'fund_exit',
  NULL,
  'cash',
  '00000000-0000-4000-8000-000000002201',
  '00000000-0000-4000-8000-000000002005',
  '00000000-0000-4000-8000-000000002001',
  20,
  1,
  'Sortie de fonds — espèces',
  'Débit 60 / crédit 57'
);

-- Sortie banque
INSERT IGNORE INTO `accounting_mapping_rules` (
  `id`, `organization_id`, `key`, `version`, `fund_op_type`,
  `match_source`, `match_payment_method`,
  `journal_id`, `debit_account_id`, `credit_account_id`,
  `priority`, `is_active`, `label`, `notes`
) VALUES (
  '00000000-0000-4000-8000-000000002407',
  '00000000-0000-4000-8000-000000000001',
  'fund_exit.bank_transfer',
  1,
  'fund_exit',
  NULL,
  'bank_transfer',
  '00000000-0000-4000-8000-000000002202',
  '00000000-0000-4000-8000-000000002005',
  '00000000-0000-4000-8000-000000002002',
  20,
  1,
  'Sortie de fonds — virement',
  'Débit 60 / crédit 521'
);

-- Sortie liée état de besoin (services extérieurs) — clé historique stub
INSERT IGNORE INTO `accounting_mapping_rules` (
  `id`, `organization_id`, `key`, `version`, `fund_op_type`,
  `match_source`, `match_payment_method`,
  `journal_id`, `debit_account_id`, `credit_account_id`,
  `priority`, `is_active`, `label`, `notes`
) VALUES (
  '00000000-0000-4000-8000-000000002408',
  '00000000-0000-4000-8000-000000000001',
  'fund_exit.expense_request',
  1,
  'fund_exit',
  NULL,
  NULL,
  '00000000-0000-4000-8000-000000002203',
  '00000000-0000-4000-8000-000000002006',
  '00000000-0000-4000-8000-000000002001',
  10,
  1,
  'Sortie liée à un état de besoin',
  'Débit 61 Services / crédit 57'
);

-- Sortie défaut
INSERT IGNORE INTO `accounting_mapping_rules` (
  `id`, `organization_id`, `key`, `version`, `fund_op_type`,
  `match_source`, `match_payment_method`,
  `journal_id`, `debit_account_id`, `credit_account_id`,
  `priority`, `is_active`, `label`, `notes`
) VALUES (
  '00000000-0000-4000-8000-000000002409',
  '00000000-0000-4000-8000-000000000001',
  'fund_exit.default',
  1,
  'fund_exit',
  NULL,
  NULL,
  '00000000-0000-4000-8000-000000002203',
  '00000000-0000-4000-8000-000000002005',
  '00000000-0000-4000-8000-000000002001',
  1,
  1,
  'Sortie de fonds — mapping par défaut',
  'Fallback wildcard'
);

-- ---------------------------------------------------------------------------
-- DOWN (manuel)
-- ---------------------------------------------------------------------------
-- DELETE FROM `accounting_mapping_rules` WHERE `id` LIKE '00000000-0000-4000-8000-00000000240%';
-- DROP TABLE IF EXISTS `accounting_mapping_rules`;
