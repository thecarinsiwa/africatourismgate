-- Daily availability slots for tour guides (admin calendar).
-- Run on existing databases after initial schema import.

CREATE TABLE IF NOT EXISTS `guide_availability` (
  `id` CHAR(36) NOT NULL,
  `guide_id` CHAR(36) NOT NULL,
  `date` DATE NOT NULL,
  `status` ENUM('available', 'unavailable') NOT NULL DEFAULT 'available',
  `created_by_user_id` CHAR(36) DEFAULT NULL,
  `updated_by_user_id` CHAR(36) DEFAULT NULL,
  `deleted_by_user_id` CHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_guide_availability_guide_date` (`guide_id`, `date`),
  KEY `idx_guide_availability_date` (`date`),
  KEY `idx_guide_availability_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_guide_availability_guide` FOREIGN KEY (`guide_id`) REFERENCES `tour_guides` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_guide_availability_created_by` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_guide_availability_updated_by` FOREIGN KEY (`updated_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_guide_availability_deleted_by` FOREIGN KEY (`deleted_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
