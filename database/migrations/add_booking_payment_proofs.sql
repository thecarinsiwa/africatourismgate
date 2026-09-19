-- Payment proofs (bank transfer / mobile money) — client upload + staff review
CREATE TABLE IF NOT EXISTS `booking_payment_proofs` (
  `id` CHAR(36) NOT NULL,
  `booking_id` CHAR(36) NOT NULL,
  `payment_id` CHAR(36) DEFAULT NULL,
  `user_id` CHAR(36) NOT NULL,
  `payment_method` ENUM('bank_transfer','mobile_money') NOT NULL,
  `original_filename` VARCHAR(255) NOT NULL,
  `stored_filename` VARCHAR(255) NOT NULL,
  `mime_type` VARCHAR(127) NOT NULL,
  `file_size_bytes` INT UNSIGNED NOT NULL,
  `status` ENUM('pending_review','approved','resubmit_requested','rejected') NOT NULL DEFAULT 'pending_review',
  `staff_note` TEXT DEFAULT NULL,
  `reviewed_by_user_id` CHAR(36) DEFAULT NULL,
  `reviewed_at` DATETIME DEFAULT NULL,
  `version` INT UNSIGNED NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_booking_payment_proofs_booking` (`booking_id`),
  KEY `idx_booking_payment_proofs_payment` (`payment_id`),
  KEY `idx_booking_payment_proofs_user` (`user_id`),
  KEY `idx_booking_payment_proofs_status` (`status`),
  CONSTRAINT `fk_booking_payment_proofs_booking`
    FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_booking_payment_proofs_payment`
    FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_booking_payment_proofs_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
