-- Geographic coordinates on catalog products for public destinations map

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'properties' AND column_name = 'latitude') = 0,
  'ALTER TABLE `properties` ADD COLUMN `latitude` DECIMAL(10, 7) DEFAULT NULL AFTER `address_line`',
  'SELECT ''properties.latitude already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'properties' AND column_name = 'longitude') = 0,
  'ALTER TABLE `properties` ADD COLUMN `longitude` DECIMAL(10, 7) DEFAULT NULL AFTER `latitude`',
  'SELECT ''properties.longitude already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'activities' AND column_name = 'latitude') = 0,
  'ALTER TABLE `activities` ADD COLUMN `latitude` DECIMAL(10, 7) DEFAULT NULL AFTER `currency`',
  'SELECT ''activities.latitude already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'activities' AND column_name = 'longitude') = 0,
  'ALTER TABLE `activities` ADD COLUMN `longitude` DECIMAL(10, 7) DEFAULT NULL AFTER `latitude`',
  'SELECT ''activities.longitude already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
