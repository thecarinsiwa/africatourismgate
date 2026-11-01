-- Vehicle routes free-text cities.
-- Baseline schema and add_vehicle_routes_troncons already create departure_city /
-- arrival_city. This migration only converts legacy destination-FK columns when
-- present; otherwise it is a no-op (fresh db:sync).

-- Add free-text columns when converting from destination FKs.
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'vehicle_routes'
      AND column_name = 'departure_destination_id') > 0
  AND (SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'vehicle_routes'
      AND column_name = 'departure_city') = 0,
  'ALTER TABLE `vehicle_routes`
     ADD COLUMN `departure_city` VARCHAR(120) NULL AFTER `vehicle_id`,
     ADD COLUMN `arrival_city` VARCHAR(120) NULL AFTER `departure_city`',
  'SELECT ''vehicle_routes.departure_city already present or no FK conversion needed'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Backfill city names from destinations (legacy only).
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'vehicle_routes'
      AND column_name = 'departure_destination_id') > 0
  AND (SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'vehicle_routes'
      AND column_name = 'departure_city') > 0,
  'UPDATE `vehicle_routes` vr
   LEFT JOIN `destinations` dep ON dep.id = vr.departure_destination_id
   LEFT JOIN `destinations` arr ON arr.id = vr.arrival_destination_id
   SET
     vr.departure_city = COALESCE(NULLIF(TRIM(dep.name), ''''), ''Départ''),
     vr.arrival_city = COALESCE(NULLIF(TRIM(arr.name), ''''), ''Arrivée'')',
  'SELECT ''vehicle_routes city backfill skipped'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop legacy FKs.
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.table_constraints
    WHERE table_schema = DATABASE()
      AND table_name = 'vehicle_routes'
      AND constraint_name = 'fk_vehicle_routes_departure'
      AND constraint_type = 'FOREIGN KEY') > 0,
  'ALTER TABLE `vehicle_routes` DROP FOREIGN KEY `fk_vehicle_routes_departure`',
  'SELECT ''fk_vehicle_routes_departure absent'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.table_constraints
    WHERE table_schema = DATABASE()
      AND table_name = 'vehicle_routes'
      AND constraint_name = 'fk_vehicle_routes_arrival'
      AND constraint_type = 'FOREIGN KEY') > 0,
  'ALTER TABLE `vehicle_routes` DROP FOREIGN KEY `fk_vehicle_routes_arrival`',
  'SELECT ''fk_vehicle_routes_arrival absent'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop legacy destination indexes / unique key before dropping columns.
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'vehicle_routes'
      AND index_name = 'uk_vehicle_routes_vehicle_od'
      AND column_name = 'departure_destination_id') > 0,
  'ALTER TABLE `vehicle_routes` DROP INDEX `uk_vehicle_routes_vehicle_od`',
  'SELECT ''uk_vehicle_routes_vehicle_od already on free-text or absent'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'vehicle_routes'
      AND index_name = 'idx_vehicle_routes_departure'
      AND column_name = 'departure_destination_id') > 0,
  'ALTER TABLE `vehicle_routes` DROP INDEX `idx_vehicle_routes_departure`',
  'SELECT ''idx_vehicle_routes_departure already on free-text or absent'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'vehicle_routes'
      AND index_name = 'idx_vehicle_routes_arrival'
      AND column_name = 'arrival_destination_id') > 0,
  'ALTER TABLE `vehicle_routes` DROP INDEX `idx_vehicle_routes_arrival`',
  'SELECT ''idx_vehicle_routes_arrival already on free-text or absent'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop legacy destination columns.
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'vehicle_routes'
      AND column_name = 'departure_destination_id') > 0,
  'ALTER TABLE `vehicle_routes`
     DROP COLUMN `departure_destination_id`,
     DROP COLUMN `arrival_destination_id`',
  'SELECT ''vehicle_routes destination columns already dropped'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ensure NOT NULL on free-text cities when converting.
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'vehicle_routes'
      AND column_name = 'departure_city'
      AND is_nullable = 'YES') > 0,
  'ALTER TABLE `vehicle_routes`
     MODIFY COLUMN `departure_city` VARCHAR(120) NOT NULL,
     MODIFY COLUMN `arrival_city` VARCHAR(120) NOT NULL',
  'SELECT ''vehicle_routes cities already NOT NULL or absent'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ensure unique / indexes on free-text cities.
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'vehicle_routes'
      AND index_name = 'uk_vehicle_routes_vehicle_od') = 0,
  'ALTER TABLE `vehicle_routes`
     ADD UNIQUE KEY `uk_vehicle_routes_vehicle_od` (`vehicle_id`, `departure_city`, `arrival_city`)',
  'SELECT ''uk_vehicle_routes_vehicle_od already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'vehicle_routes'
      AND index_name = 'idx_vehicle_routes_departure') = 0,
  'ALTER TABLE `vehicle_routes` ADD KEY `idx_vehicle_routes_departure` (`departure_city`)',
  'SELECT ''idx_vehicle_routes_departure already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'vehicle_routes'
      AND index_name = 'idx_vehicle_routes_arrival') = 0,
  'ALTER TABLE `vehicle_routes` ADD KEY `idx_vehicle_routes_arrival` (`arrival_city`)',
  'SELECT ''idx_vehicle_routes_arrival already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
