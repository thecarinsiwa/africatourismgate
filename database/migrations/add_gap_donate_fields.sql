-- GAP site settings — bouton Donate (defensive: columns may already exist in fresh schema import)

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'gap_site_settings' AND column_name = 'donate_url') = 0,
  'ALTER TABLE `gap_site_settings` ADD COLUMN `donate_url` VARCHAR(512) DEFAULT NULL AFTER `unesco_url`',
  'SELECT ''gap_site_settings.donate_url already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'gap_site_settings' AND column_name = 'donate_label') = 0,
  'ALTER TABLE `gap_site_settings` ADD COLUMN `donate_label` VARCHAR(120) DEFAULT NULL AFTER `donate_url`',
  'SELECT ''gap_site_settings.donate_label already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
