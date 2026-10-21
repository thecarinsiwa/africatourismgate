-- TRESO-003 — États de besoin + sorties de fonds + pivot réservations (0,N) + justificatifs
-- Contrainte : fund_exits.expense_request_id NOT NULL (sortie impossible sans état de besoin).
-- Down (manuel) : voir commentaires en bas de fichier.
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `expense_requests` (
  `id` CHAR(36) NOT NULL,
  `organization_id` CHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `requested_amount_cents` INT NOT NULL,
  `currency` CHAR(3) NOT NULL,
  `status` ENUM(
    'draft',
    'submitted',
    'validated',
    'authorized',
    'rejected',
    'cancelled',
    'closed'
  ) NOT NULL DEFAULT 'draft',
  `requested_by_user_id` CHAR(36) DEFAULT NULL,
  -- FK vers treasury_external_collaborators ajoutée en TRESO-005
  `requested_by_external_id` CHAR(36) DEFAULT NULL,
  `needed_by_date` DATE DEFAULT NULL,
  `rejection_reason` TEXT DEFAULT NULL,
  `submitted_at` DATETIME DEFAULT NULL,
  `validated_at` DATETIME DEFAULT NULL,
  `validated_by_user_id` CHAR(36) DEFAULT NULL,
  `authorized_at` DATETIME DEFAULT NULL,
  `authorized_by_user_id` CHAR(36) DEFAULT NULL,
  `closed_at` DATETIME DEFAULT NULL,
  `created_by_user_id` CHAR(36) DEFAULT NULL,
  `updated_by_user_id` CHAR(36) DEFAULT NULL,
  `deleted_by_user_id` CHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_expense_requests_org` (`organization_id`),
  KEY `idx_expense_requests_status` (`status`),
  KEY `idx_expense_requests_requested_by_user` (`requested_by_user_id`),
  KEY `idx_expense_requests_requested_by_external` (`requested_by_external_id`),
  KEY `idx_expense_requests_needed_by` (`needed_by_date`),
  KEY `idx_expense_requests_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_expense_requests_org`
    FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_expense_requests_requested_by_user`
    FOREIGN KEY (`requested_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_expense_requests_validated_by`
    FOREIGN KEY (`validated_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_expense_requests_authorized_by`
    FOREIGN KEY (`authorized_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_expense_requests_created_by`
    FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_expense_requests_updated_by`
    FOREIGN KEY (`updated_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_expense_requests_deleted_by`
    FOREIGN KEY (`deleted_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `expense_request_status_history` (
  `id` CHAR(36) NOT NULL,
  `expense_request_id` CHAR(36) NOT NULL,
  `from_status` ENUM(
    'draft',
    'submitted',
    'validated',
    'authorized',
    'rejected',
    'cancelled',
    'closed'
  ) DEFAULT NULL,
  `to_status` ENUM(
    'draft',
    'submitted',
    'validated',
    'authorized',
    'rejected',
    'cancelled',
    'closed'
  ) NOT NULL,
  `actor_type` ENUM('user', 'external', 'system') NOT NULL DEFAULT 'user',
  `actor_id` CHAR(36) DEFAULT NULL,
  `comment` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_expense_request_status_history_request` (`expense_request_id`),
  KEY `idx_expense_request_status_history_created` (`created_at`),
  CONSTRAINT `fk_expense_request_status_history_request`
    FOREIGN KEY (`expense_request_id`) REFERENCES `expense_requests` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `fund_exits` (
  `id` CHAR(36) NOT NULL,
  `organization_id` CHAR(36) NOT NULL,
  `expense_request_id` CHAR(36) NOT NULL,
  `amount_cents` INT NOT NULL,
  `currency` CHAR(3) NOT NULL,
  `operation_date` DATE NOT NULL,
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
  `status` ENUM('draft', 'disbursed', 'recorded', 'voided') NOT NULL DEFAULT 'draft',
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
  KEY `idx_fund_exits_org` (`organization_id`),
  KEY `idx_fund_exits_expense_request` (`expense_request_id`),
  KEY `idx_fund_exits_operation_date` (`operation_date`),
  KEY `idx_fund_exits_currency` (`currency`),
  KEY `idx_fund_exits_payment_method` (`payment_method`),
  KEY `idx_fund_exits_status` (`status`),
  KEY `idx_fund_exits_created_by` (`created_by_user_id`),
  KEY `idx_fund_exits_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_fund_exits_org`
    FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_fund_exits_expense_request`
    FOREIGN KEY (`expense_request_id`) REFERENCES `expense_requests` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_fund_exits_created_by`
    FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_fund_exits_updated_by`
    FOREIGN KEY (`updated_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_fund_exits_deleted_by`
    FOREIGN KEY (`deleted_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_fund_exits_voided_by`
    FOREIGN KEY (`voided_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `fund_exit_bookings` (
  `id` CHAR(36) NOT NULL,
  `fund_exit_id` CHAR(36) NOT NULL,
  `booking_id` CHAR(36) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_fund_exit_bookings_pair` (`fund_exit_id`, `booking_id`),
  KEY `idx_fund_exit_bookings_booking` (`booking_id`),
  CONSTRAINT `fk_fund_exit_bookings_exit`
    FOREIGN KEY (`fund_exit_id`) REFERENCES `fund_exits` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_fund_exit_bookings_booking`
    FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `fund_exit_attachments` (
  `id` CHAR(36) NOT NULL,
  `fund_exit_id` CHAR(36) NOT NULL,
  `original_filename` VARCHAR(255) NOT NULL,
  `stored_filename` VARCHAR(255) NOT NULL,
  `mime_type` VARCHAR(127) NOT NULL,
  `file_size_bytes` INT UNSIGNED NOT NULL,
  `uploaded_by_user_id` CHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_fund_exit_attachments_exit` (`fund_exit_id`),
  KEY `idx_fund_exit_attachments_uploader` (`uploaded_by_user_id`),
  CONSTRAINT `fk_fund_exit_attachments_exit`
    FOREIGN KEY (`fund_exit_id`) REFERENCES `fund_exits` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_fund_exit_attachments_uploader`
    FOREIGN KEY (`uploaded_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- DOWN (manuel — ne pas placer dans un .sql auto-appliqué par db:sync)
-- ---------------------------------------------------------------------------
-- DROP TABLE IF EXISTS `fund_exit_attachments`;
-- DROP TABLE IF EXISTS `fund_exit_bookings`;
-- DROP TABLE IF EXISTS `fund_exits`;
-- DROP TABLE IF EXISTS `expense_request_status_history`;
-- DROP TABLE IF EXISTS `expense_requests`;
