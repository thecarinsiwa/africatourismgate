-- Booking status change audit trail (Livrable #30)
CREATE TABLE IF NOT EXISTS `booking_status_history` (
  `id` CHAR(36) NOT NULL,
  `booking_id` CHAR(36) NOT NULL,
  `from_status` ENUM('draft','pending_payment','confirmed','cancelled','refunded') DEFAULT NULL,
  `to_status` ENUM('draft','pending_payment','confirmed','cancelled','refunded') NOT NULL,
  `reason` TEXT DEFAULT NULL,
  `changed_by_user_id` CHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_booking_status_history_booking` (`booking_id`),
  KEY `idx_booking_status_history_created` (`created_at`),
  CONSTRAINT `fk_booking_status_history_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_booking_status_history_user` FOREIGN KEY (`changed_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
