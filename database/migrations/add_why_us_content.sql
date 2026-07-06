CREATE TABLE IF NOT EXISTS `why_us_sections` (
  `id` CHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `subtitle` TEXT NOT NULL,
  `status` ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
  `locale` VARCHAR(5) NOT NULL DEFAULT 'fr',
  `created_by_user_id` CHAR(36) DEFAULT NULL,
  `updated_by_user_id` CHAR(36) DEFAULT NULL,
  `deleted_by_user_id` CHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_why_us_sections_locale` (`locale`),
  KEY `idx_why_us_sections_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `why_us_items` (
  `id` CHAR(36) NOT NULL,
  `title` VARCHAR(160) NOT NULL,
  `description` TEXT NOT NULL,
  `link_url` VARCHAR(512) NOT NULL,
  `icon_key` ENUM('globe', 'search', 'booking', 'support') NOT NULL DEFAULT 'globe',
  `sort_order` INT NOT NULL DEFAULT 0,
  `status` ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
  `locale` VARCHAR(5) NOT NULL DEFAULT 'fr',
  `created_by_user_id` CHAR(36) DEFAULT NULL,
  `updated_by_user_id` CHAR(36) DEFAULT NULL,
  `deleted_by_user_id` CHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_why_us_items_status_sort` (`status`, `sort_order`),
  KEY `idx_why_us_items_locale` (`locale`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `why_us_sections` (
  `id`, `title`, `subtitle`, `status`, `locale`, `created_by_user_id`
) VALUES (
  '00000000-0000-4000-8000-00000000b001',
  'Pourquoi nous choisir',
  'Africa Tourism Gate vous offre une expérience de voyage unique avec les meilleurs services et un accompagnement personnalisé pour découvrir l''Afrique.',
  'published',
  'fr',
  '00000000-0000-4000-8000-000000000010'
)
ON DUPLICATE KEY UPDATE
  `title` = VALUES(`title`),
  `subtitle` = VALUES(`subtitle`),
  `status` = VALUES(`status`);

INSERT INTO `why_us_items` (
  `id`, `title`, `description`, `link_url`, `icon_key`, `sort_order`,
  `status`, `locale`, `created_by_user_id`
) VALUES
(
  '00000000-0000-4000-8000-00000000b101',
  'Voyages Incroyables',
  'Des destinations uniques sélectionnées avec soin à travers tout le continent africain pour des expériences inoubliables.',
  '/about/who-we-are',
  'globe',
  1,
  'published',
  'fr',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000b102',
  'Découvertes',
  'Explorez la richesse culturelle, les paysages époustouflants et la faune sauvage de l''Afrique.',
  '/about/how-we-work',
  'search',
  2,
  'published',
  'fr',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000b103',
  'Réservation Facile',
  'Réservez vos hébergements, vols et activités en quelques clics grâce à notre plateforme intuitive.',
  '/about/how-we-work',
  'booking',
  3,
  'published',
  'fr',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000b104',
  'Support 24/7',
  'Notre équipe de spécialistes du voyage est disponible jour et nuit pour vous accompagner.',
  '/about/contact',
  'support',
  4,
  'published',
  'fr',
  '00000000-0000-4000-8000-000000000010'
)
ON DUPLICATE KEY UPDATE
  `title` = VALUES(`title`),
  `description` = VALUES(`description`),
  `link_url` = VALUES(`link_url`),
  `icon_key` = VALUES(`icon_key`),
  `sort_order` = VALUES(`sort_order`),
  `status` = VALUES(`status`);
