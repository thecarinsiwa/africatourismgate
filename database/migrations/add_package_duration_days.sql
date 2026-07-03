-- Package duration in days (defensive: column may already exist in fresh schema import)

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'packages' AND column_name = 'duration_days') = 0,
  'ALTER TABLE `packages` ADD COLUMN `duration_days` SMALLINT UNSIGNED NOT NULL DEFAULT 3',
  'SELECT ''packages.duration_days already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
