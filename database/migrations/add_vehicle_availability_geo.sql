-- Pickup coordinates on vehicle availability slots (defensive: columns may already exist)

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'vehicle_availability' AND column_name = 'latitude') = 0,
  'ALTER TABLE `vehicle_availability` ADD COLUMN `latitude` DECIMAL(10, 7) DEFAULT NULL AFTER `status`',
  'SELECT ''vehicle_availability.latitude already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'vehicle_availability' AND column_name = 'longitude') = 0,
  'ALTER TABLE `vehicle_availability` ADD COLUMN `longitude` DECIMAL(10, 7) DEFAULT NULL AFTER `latitude`',
  'SELECT ''vehicle_availability.longitude already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
