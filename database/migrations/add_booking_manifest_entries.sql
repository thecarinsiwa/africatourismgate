-- Per-traveler manifest entries for a booking (names, ages, nationality, etc.)
CREATE TABLE IF NOT EXISTS `booking_manifest_entries` (
  `id` CHAR(36) NOT NULL,
  `booking_id` CHAR(36) NOT NULL,
  `sort_order` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `full_name` VARCHAR(200) NOT NULL,
  `age` TINYINT UNSIGNED DEFAULT NULL,
  `sex` ENUM('M','F','other') DEFAULT NULL,
  `nationality` VARCHAR(100) DEFAULT NULL,
  `id_number` VARCHAR(64) DEFAULT NULL,
  `conditions` TEXT DEFAULT NULL,
  `comment` TEXT DEFAULT NULL,
  `other` TEXT DEFAULT NULL,
  `created_by_user_id` CHAR(36) DEFAULT NULL,
  `updated_by_user_id` CHAR(36) DEFAULT NULL,
  `deleted_by_user_id` CHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_booking_manifest_booking` (`booking_id`, `sort_order`),
  CONSTRAINT `fk_booking_manifest_booking`
    FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
