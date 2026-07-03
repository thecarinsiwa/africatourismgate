-- Activity difficulty level (defensive: column may already exist in fresh schema import)
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'activities' AND column_name = 'difficulty_level') = 0,
  'ALTER TABLE `activities` ADD COLUMN `difficulty_level` ENUM(''easy'',''moderate'',''hard'',''expert'') DEFAULT NULL AFTER `duration_minutes`',
  'SELECT ''activities.difficulty_level already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
