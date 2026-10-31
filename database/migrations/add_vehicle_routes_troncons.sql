-- Vehicle routes (tronçons): fixed price by departure → arrival destination.
-- Replaces vehicles.daily_price_cents. Extends package_items with item_type 'troncon'.

CREATE TABLE IF NOT EXISTS `vehicle_routes` (
  `id` CHAR(36) NOT NULL,
  `vehicle_id` CHAR(36) NOT NULL,
  `departure_destination_id` CHAR(36) NOT NULL,
  `arrival_destination_id` CHAR(36) NOT NULL,
  `price_cents` INT UNSIGNED NOT NULL,
  `currency` CHAR(3) NOT NULL DEFAULT 'USD',
  `created_by_user_id` CHAR(36) DEFAULT NULL,
  `updated_by_user_id` CHAR(36) DEFAULT NULL,
  `deleted_by_user_id` CHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_vehicle_routes_vehicle_od` (`vehicle_id`, `departure_destination_id`, `arrival_destination_id`),
  KEY `idx_vehicle_routes_vehicle` (`vehicle_id`),
  KEY `idx_vehicle_routes_departure` (`departure_destination_id`),
  KEY `idx_vehicle_routes_arrival` (`arrival_destination_id`),
  KEY `idx_vehicle_routes_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_vehicle_routes_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_vehicle_routes_departure` FOREIGN KEY (`departure_destination_id`) REFERENCES `destinations` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_vehicle_routes_arrival` FOREIGN KEY (`arrival_destination_id`) REFERENCES `destinations` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_vehicle_routes_created_by` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_vehicle_routes_updated_by` FOREIGN KEY (`updated_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_vehicle_routes_deleted_by` FOREIGN KEY (`deleted_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `package_items`
  MODIFY COLUMN `item_type` ENUM(
    'property',
    'flight',
    'vehicle',
    'cruise',
    'activity',
    'troncon'
  ) NOT NULL;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'vehicles'
      AND column_name = 'daily_price_cents') > 0,
  'ALTER TABLE `vehicles` DROP COLUMN `daily_price_cents`',
  'SELECT ''vehicles.daily_price_cents already dropped'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
