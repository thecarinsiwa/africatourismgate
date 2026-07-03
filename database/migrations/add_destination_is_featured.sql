-- Featured destination flag (defensive: column may already exist in fresh schema import)

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'destinations' AND column_name = 'is_featured') = 0,
  'ALTER TABLE `destinations` ADD COLUMN `is_featured` TINYINT(1) NOT NULL DEFAULT 0 AFTER `longitude`',
  'SELECT ''destinations.is_featured already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
