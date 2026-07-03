-- Destination hero image and geo coordinates (defensive: columns may already exist in fresh schema import)

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'destinations' AND column_name = 'image_url') = 0,
  'ALTER TABLE `destinations` ADD COLUMN `image_url` VARCHAR(512) DEFAULT NULL AFTER `description`',
  'SELECT ''destinations.image_url already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'destinations' AND column_name = 'latitude') = 0,
  'ALTER TABLE `destinations` ADD COLUMN `latitude` DECIMAL(10, 7) DEFAULT NULL AFTER `image_url`',
  'SELECT ''destinations.latitude already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'destinations' AND column_name = 'longitude') = 0,
  'ALTER TABLE `destinations` ADD COLUMN `longitude` DECIMAL(10, 7) DEFAULT NULL AFTER `latitude`',
  'SELECT ''destinations.longitude already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
