-- Identity documents per booking (upload, staff review, resubmit request)
CREATE TABLE IF NOT EXISTS `booking_identity_documents` (
  `id` CHAR(36) NOT NULL,
  `booking_id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `document_type` ENUM('passport','national_id','drivers_license','other') NOT NULL,
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
  KEY `idx_booking_identity_documents_booking` (`booking_id`),
  KEY `idx_booking_identity_documents_user` (`user_id`),
  CONSTRAINT `fk_booking_identity_documents_booking`
    FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_booking_identity_documents_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
