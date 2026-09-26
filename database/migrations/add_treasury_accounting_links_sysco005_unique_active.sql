-- SYSCO-005 — Unicité accounting_links parmi non soft-deleted
-- Permet recreate après soft-delete d’un link pending/skipped.
-- Down (manuel) : voir commentaires en bas.
SET NAMES utf8mb4;

-- Colonne générée : NULL si soft-deleted → plusieurs NULLs OK sous UNIQUE MySQL
SET @col_exists := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'accounting_links'
    AND COLUMN_NAME = 'uniq_fund_op'
);

SET @sql := IF(
  @col_exists = 0,
  'ALTER TABLE `accounting_links`
     ADD COLUMN `uniq_fund_op` VARCHAR(80) GENERATED ALWAYS AS (
       CASE
         WHEN `deleted_at` IS NULL THEN CONCAT(`fund_op_type`, '':'', `fund_op_id`)
         ELSE NULL
       END
     ) STORED',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Remplacer l’unique historique (bloque même soft-deleted)
SET @idx_old := (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'accounting_links'
    AND INDEX_NAME = 'uk_accounting_links_fund_op'
);

SET @sql := IF(
  @idx_old > 0,
  'ALTER TABLE `accounting_links` DROP INDEX `uk_accounting_links_fund_op`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_new := (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'accounting_links'
    AND INDEX_NAME = 'uk_accounting_links_fund_op_active'
);

SET @sql := IF(
  @idx_new = 0,
  'ALTER TABLE `accounting_links`
     ADD UNIQUE KEY `uk_accounting_links_fund_op_active` (`uniq_fund_op`)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Commentaire journal_entry_id
ALTER TABLE `accounting_links`
  MODIFY COLUMN `journal_entry_id` CHAR(36) DEFAULT NULL
    COMMENT 'UUID journal_entries — renseigné quand status=linked (SYSCO-005)';

-- ---------------------------------------------------------------------------
-- DOWN (manuel)
-- ---------------------------------------------------------------------------
-- ALTER TABLE `accounting_links` DROP INDEX `uk_accounting_links_fund_op_active`;
-- ALTER TABLE `accounting_links` DROP COLUMN `uniq_fund_op`;
-- ALTER TABLE `accounting_links` ADD UNIQUE KEY `uk_accounting_links_fund_op` (`fund_op_type`, `fund_op_id`);
