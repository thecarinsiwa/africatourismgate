-- POS-3: Scope catalogue racines par organisation (NULL = partagé).
-- Tables: activities, properties, flights, vehicles, cabins

-- activities
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'activities' AND column_name = 'organization_id') = 0,
  'ALTER TABLE `activities` ADD COLUMN `organization_id` CHAR(36) DEFAULT NULL AFTER `currency`',
  'SELECT ''activities.organization_id already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'activities' AND index_name = 'idx_activities_org') = 0,
  'CREATE INDEX `idx_activities_org` ON `activities` (`organization_id`)',
  'SELECT ''idx_activities_org already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'activities' AND constraint_name = 'fk_activities_org') = 0,
  'ALTER TABLE `activities` ADD CONSTRAINT `fk_activities_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE SET NULL',
  'SELECT ''fk_activities_org already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- properties
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'properties' AND column_name = 'organization_id') = 0,
  'ALTER TABLE `properties` ADD COLUMN `organization_id` CHAR(36) DEFAULT NULL AFTER `address_line`',
  'SELECT ''properties.organization_id already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'properties' AND index_name = 'idx_properties_org') = 0,
  'CREATE INDEX `idx_properties_org` ON `properties` (`organization_id`)',
  'SELECT ''idx_properties_org already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'properties' AND constraint_name = 'fk_properties_org') = 0,
  'ALTER TABLE `properties` ADD CONSTRAINT `fk_properties_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE SET NULL',
  'SELECT ''fk_properties_org already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- flights
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'flights' AND column_name = 'organization_id') = 0,
  'ALTER TABLE `flights` ADD COLUMN `organization_id` CHAR(36) DEFAULT NULL AFTER `duration_minutes`',
  'SELECT ''flights.organization_id already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'flights' AND index_name = 'idx_flights_org') = 0,
  'CREATE INDEX `idx_flights_org` ON `flights` (`organization_id`)',
  'SELECT ''idx_flights_org already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'flights' AND constraint_name = 'fk_flights_org') = 0,
  'ALTER TABLE `flights` ADD CONSTRAINT `fk_flights_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE SET NULL',
  'SELECT ''fk_flights_org already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- vehicles
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'vehicles' AND column_name = 'organization_id') = 0,
  'ALTER TABLE `vehicles` ADD COLUMN `organization_id` CHAR(36) DEFAULT NULL AFTER `currency`',
  'SELECT ''vehicles.organization_id already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'vehicles' AND index_name = 'idx_vehicles_org') = 0,
  'CREATE INDEX `idx_vehicles_org` ON `vehicles` (`organization_id`)',
  'SELECT ''idx_vehicles_org already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'vehicles' AND constraint_name = 'fk_vehicles_org') = 0,
  'ALTER TABLE `vehicles` ADD CONSTRAINT `fk_vehicles_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE SET NULL',
  'SELECT ''fk_vehicles_org already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- cabins
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'cabins' AND column_name = 'organization_id') = 0,
  'ALTER TABLE `cabins` ADD COLUMN `organization_id` CHAR(36) DEFAULT NULL AFTER `currency`',
  'SELECT ''cabins.organization_id already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'cabins' AND index_name = 'idx_cabins_org') = 0,
  'CREATE INDEX `idx_cabins_org` ON `cabins` (`organization_id`)',
  'SELECT ''idx_cabins_org already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'cabins' AND constraint_name = 'fk_cabins_org') = 0,
  'ALTER TABLE `cabins` ADD CONSTRAINT `fk_cabins_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE SET NULL',
  'SELECT ''fk_cabins_org already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
