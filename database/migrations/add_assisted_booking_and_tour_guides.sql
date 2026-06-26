-- CE-1: Assisted booking workflow — pending_approval status, tour guides, booking messages
-- Run on existing databases after initial schema import.

ALTER TABLE `bookings`
  MODIFY COLUMN `status` ENUM(
    'draft',
    'pending_approval',
    'pending_payment',
    'confirmed',
    'cancelled',
    'refunded'
  ) NOT NULL DEFAULT 'draft';

ALTER TABLE `booking_status_history`
  MODIFY COLUMN `from_status` ENUM(
    'draft',
    'pending_approval',
    'pending_payment',
    'confirmed',
    'cancelled',
    'refunded'
  ) DEFAULT NULL;

ALTER TABLE `booking_status_history`
  MODIFY COLUMN `to_status` ENUM(
    'draft',
    'pending_approval',
    'pending_payment',
    'confirmed',
    'cancelled',
    'refunded'
  ) NOT NULL;

CREATE TABLE IF NOT EXISTS `tour_guides` (
  `id` CHAR(36) NOT NULL,
  `type` ENUM('internal','external') NOT NULL,
  `user_id` CHAR(36) DEFAULT NULL,
  `organization_id` CHAR(36) DEFAULT NULL,
  `display_name` VARCHAR(180) NOT NULL,
  `bio` TEXT DEFAULT NULL,
  `photo_url` VARCHAR(512) DEFAULT NULL,
  `languages` JSON NOT NULL,
  `destinations` JSON NOT NULL,
  `status` ENUM('active','inactive') NOT NULL DEFAULT 'active',
  `created_by_user_id` CHAR(36) DEFAULT NULL,
  `updated_by_user_id` CHAR(36) DEFAULT NULL,
  `deleted_by_user_id` CHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_tour_guides_org` (`organization_id`),
  KEY `idx_tour_guides_user` (`user_id`),
  KEY `idx_tour_guides_type_status` (`type`, `status`),
  KEY `idx_tour_guides_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_tour_guides_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_tour_guides_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_tour_guides_created_by` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_tour_guides_updated_by` FOREIGN KEY (`updated_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_tour_guides_deleted_by` FOREIGN KEY (`deleted_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `booking_guide_assignments` (
  `id` CHAR(36) NOT NULL,
  `booking_id` CHAR(36) NOT NULL,
  `guide_id` CHAR(36) NOT NULL,
  `role` ENUM('primary','secondary') NOT NULL DEFAULT 'primary',
  `assigned_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `assigned_by_user_id` CHAR(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_booking_guide` (`booking_id`, `guide_id`),
  KEY `idx_booking_guide_assignments_booking` (`booking_id`),
  KEY `idx_booking_guide_assignments_guide` (`guide_id`),
  CONSTRAINT `fk_booking_guide_assignments_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_booking_guide_assignments_guide` FOREIGN KEY (`guide_id`) REFERENCES `tour_guides` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_booking_guide_assignments_user` FOREIGN KEY (`assigned_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `booking_messages` (
  `id` CHAR(36) NOT NULL,
  `booking_id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) DEFAULT NULL,
  `body` TEXT NOT NULL,
  `is_staff` TINYINT(1) NOT NULL DEFAULT 0,
  `created_by_user_id` CHAR(36) DEFAULT NULL,
  `updated_by_user_id` CHAR(36) DEFAULT NULL,
  `deleted_by_user_id` CHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_booking_messages_booking` (`booking_id`),
  KEY `idx_booking_messages_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_booking_messages_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_booking_messages_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_booking_messages_created_by` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_booking_messages_updated_by` FOREIGN KEY (`updated_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_booking_messages_deleted_by` FOREIGN KEY (`deleted_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `organization_settings` (
  `id`, `organization_id`, `setting_group`, `setting_key`, `setting_value`, `created_by_user_id`
) VALUES (
  '00000000-0000-4000-8000-000000000018',
  '00000000-0000-4000-8000-000000000001',
  'booking',
  'item_type_modes',
  '{"room":"immediate","flight_class":"immediate","vehicle":"immediate","cabin":"immediate","activity_schedule":"assisted","package":"assisted"}',
  '00000000-0000-4000-8000-000000000010'
);

INSERT IGNORE INTO `tour_guides` (
  `id`, `type`, `user_id`, `organization_id`, `display_name`, `bio`, `photo_url`,
  `languages`, `destinations`, `status`, `created_by_user_id`
) VALUES
(
  '00000000-0000-4000-8000-000000000701',
  'internal',
  '00000000-0000-4000-8000-000000000010',
  '00000000-0000-4000-8000-000000000001',
  'Marie Kabila',
  'Guide senior spécialisée Kinshasa et région du Kongo Central. 8 ans d''expérience.',
  NULL,
  '["fr","en","ln"]',
  '["00000000-0000-4000-8000-000000002001"]',
  'active',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-000000000702',
  'external',
  NULL,
  '00000000-0000-4000-8000-000000000001',
  'Jean-Pierre Mwamba',
  'Guide indépendant, circuits culturels et nature en RDC.',
  NULL,
  '["fr","sw"]',
  '["00000000-0000-4000-8000-000000002001"]',
  'active',
  '00000000-0000-4000-8000-000000000010'
);
