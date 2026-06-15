-- Email operation verification codes (register, Google signup, booking)
CREATE TABLE IF NOT EXISTS `email_operation_verifications` (
  `id` CHAR(36) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `purpose` ENUM('register','google_signup','login','booking') NOT NULL,
  `reference_id` CHAR(36) NOT NULL,
  `code_hash` VARCHAR(64) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `verified_at` DATETIME DEFAULT NULL,
  `abandonment_reminder_sent_at` DATETIME DEFAULT NULL,
  `metadata` JSON DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_email_op_verif_email` (`email`),
  KEY `idx_email_op_verif_ref` (`reference_id`),
  KEY `idx_email_op_verif_pending` (`verified_at`, `expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
