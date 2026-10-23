-- Allow booking inquiries when an activity has no available slots,
-- plus storage for public activity booking requests.

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'activities' AND column_name = 'allow_booking_requests_when_unavailable') = 0,
  'ALTER TABLE `activities` ADD COLUMN `allow_booking_requests_when_unavailable` TINYINT(1) NOT NULL DEFAULT 0 AFTER `organization_id`',
  'SELECT ''activities.allow_booking_requests_when_unavailable already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS `activity_booking_requests` (
  `id` CHAR(36) NOT NULL,
  `activity_id` CHAR(36) NOT NULL,
  `organization_id` CHAR(36) DEFAULT NULL,
  `full_name` VARCHAR(180) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(40) DEFAULT NULL,
  `preferred_date` DATE NOT NULL,
  `participants` SMALLINT UNSIGNED NOT NULL,
  `message` TEXT DEFAULT NULL,
  `status` ENUM('pending', 'contacted', 'confirmed', 'cancelled') NOT NULL DEFAULT 'pending',
  `created_by_user_id` CHAR(36) DEFAULT NULL,
  `updated_by_user_id` CHAR(36) DEFAULT NULL,
  `deleted_by_user_id` CHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_activity_booking_requests_activity` (`activity_id`),
  KEY `idx_activity_booking_requests_org` (`organization_id`),
  KEY `idx_activity_booking_requests_status` (`status`),
  KEY `idx_activity_booking_requests_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_activity_booking_requests_activity` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_activity_booking_requests_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_activity_booking_requests_created_by` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_activity_booking_requests_updated_by` FOREIGN KEY (`updated_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_activity_booking_requests_deleted_by` FOREIGN KEY (`deleted_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
