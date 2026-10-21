-- TRESO-002 — Entrées de fonds + pivot réservations (0,N) + justificatifs (métadonnées)
-- Down (manuel) : voir commentaires en bas de fichier.
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `fund_entries` (
  `id` CHAR(36) NOT NULL,
  `organization_id` CHAR(36) NOT NULL,
  `amount_cents` INT NOT NULL,
  `currency` CHAR(3) NOT NULL,
  `operation_date` DATE NOT NULL,
  `source` ENUM(
    'booking_payment',
    'customer_direct',
    'partner',
    'grant_donation',
    'owner_capital',
    'bank_interest',
    'other'
  ) NOT NULL,
  `payment_method` ENUM(
    'cash',
    'bank_transfer',
    'mobile_money',
    'stripe',
    'cheque',
    'other'
  ) NOT NULL,
  `reference` VARCHAR(120) DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `status` ENUM('recorded', 'voided') NOT NULL DEFAULT 'recorded',
  `voided_at` DATETIME DEFAULT NULL,
  `voided_by_user_id` CHAR(36) DEFAULT NULL,
  `void_reason` TEXT DEFAULT NULL,
  `created_by_user_id` CHAR(36) DEFAULT NULL,
  `updated_by_user_id` CHAR(36) DEFAULT NULL,
  `deleted_by_user_id` CHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_fund_entries_org` (`organization_id`),
  KEY `idx_fund_entries_operation_date` (`operation_date`),
  KEY `idx_fund_entries_currency` (`currency`),
  KEY `idx_fund_entries_source` (`source`),
  KEY `idx_fund_entries_payment_method` (`payment_method`),
  KEY `idx_fund_entries_status` (`status`),
  KEY `idx_fund_entries_created_by` (`created_by_user_id`),
  KEY `idx_fund_entries_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_fund_entries_org`
    FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_fund_entries_created_by`
    FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_fund_entries_updated_by`
    FOREIGN KEY (`updated_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_fund_entries_deleted_by`
    FOREIGN KEY (`deleted_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_fund_entries_voided_by`
    FOREIGN KEY (`voided_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `fund_entry_bookings` (
  `id` CHAR(36) NOT NULL,
  `fund_entry_id` CHAR(36) NOT NULL,
  `booking_id` CHAR(36) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_fund_entry_bookings_pair` (`fund_entry_id`, `booking_id`),
  KEY `idx_fund_entry_bookings_booking` (`booking_id`),
  CONSTRAINT `fk_fund_entry_bookings_entry`
    FOREIGN KEY (`fund_entry_id`) REFERENCES `fund_entries` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_fund_entry_bookings_booking`
    FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `fund_entry_attachments` (
  `id` CHAR(36) NOT NULL,
  `fund_entry_id` CHAR(36) NOT NULL,
  `original_filename` VARCHAR(255) NOT NULL,
  `stored_filename` VARCHAR(255) NOT NULL,
  `mime_type` VARCHAR(127) NOT NULL,
  `file_size_bytes` INT UNSIGNED NOT NULL,
  `uploaded_by_user_id` CHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_fund_entry_attachments_entry` (`fund_entry_id`),
  KEY `idx_fund_entry_attachments_uploader` (`uploaded_by_user_id`),
  CONSTRAINT `fk_fund_entry_attachments_entry`
    FOREIGN KEY (`fund_entry_id`) REFERENCES `fund_entries` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_fund_entry_attachments_uploader`
    FOREIGN KEY (`uploaded_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- DOWN (manuel — ne pas placer dans un .sql auto-appliqué par db:sync)
-- ---------------------------------------------------------------------------
-- DROP TABLE IF EXISTS `fund_entry_attachments`;
-- DROP TABLE IF EXISTS `fund_entry_bookings`;
-- DROP TABLE IF EXISTS `fund_entries`;
