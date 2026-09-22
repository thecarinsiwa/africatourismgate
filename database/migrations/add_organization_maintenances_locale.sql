-- Locale des fenêtres de maintenance (fr | en | es).

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'organization_maintenances' AND column_name = 'locale') = 0,
  'ALTER TABLE `organization_maintenances` ADD COLUMN `locale` VARCHAR(5) NOT NULL DEFAULT ''fr'' AFTER `organization_id`',
  'SELECT ''organization_maintenances.locale already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE `organization_maintenances`
SET `locale` = 'fr'
WHERE `locale` IS NULL OR TRIM(`locale`) = '';

SET @idx = IF(
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'organization_maintenances' AND index_name = 'idx_org_maintenances_locale') = 0,
  'ALTER TABLE `organization_maintenances` ADD KEY `idx_org_maintenances_locale` (`organization_id`, `locale`, `enabled`, `starts_at`, `ends_at`)',
  'SELECT ''idx_org_maintenances_locale already exists'''
);
PREPARE stmt FROM @idx;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
