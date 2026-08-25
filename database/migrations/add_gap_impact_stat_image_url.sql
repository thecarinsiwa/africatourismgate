-- Optional image for GAP impact stats.
SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.columns
   WHERE table_schema = DATABASE()
     AND table_name = 'gap_impact_stats'
     AND column_name = 'image_url') = 0,
  'ALTER TABLE `gap_impact_stats` ADD COLUMN `image_url` VARCHAR(1024) DEFAULT NULL AFTER `description`',
  'SELECT ''gap_impact_stats.image_url already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
