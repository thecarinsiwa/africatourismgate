-- Activity itinerary stop duration (defensive: column may already exist in fresh schema import)

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'activity_itinerary_stops' AND column_name = 'duration_minutes') = 0,
  'ALTER TABLE `activity_itinerary_stops` ADD COLUMN `duration_minutes` INT DEFAULT NULL AFTER `description`',
  'SELECT ''activity_itinerary_stops.duration_minutes already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
