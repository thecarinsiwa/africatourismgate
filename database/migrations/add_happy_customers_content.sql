CREATE TABLE IF NOT EXISTS `happy_customers_sections` (
  `id` CHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `subtitle` TEXT NOT NULL,
  `paragraph1` TEXT NOT NULL,
  `paragraph2` TEXT NOT NULL,
  `image_url` VARCHAR(1024) NOT NULL,
  `image_alt` VARCHAR(255) NOT NULL,
  `badge_value` VARCHAR(32) NOT NULL DEFAULT '10K+',
  `badge_label` VARCHAR(64) NOT NULL DEFAULT 'Clients',
  `status` ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
  `locale` VARCHAR(5) NOT NULL DEFAULT 'fr',
  `created_by_user_id` CHAR(36) DEFAULT NULL,
  `updated_by_user_id` CHAR(36) DEFAULT NULL,
  `deleted_by_user_id` CHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_happy_customers_sections_locale` (`locale`),
  KEY `idx_happy_customers_sections_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `happy_customers_stats` (
  `id` CHAR(36) NOT NULL,
  `label` VARCHAR(120) NOT NULL,
  `percent_value` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `color_key` ENUM('primary', 'secondary') NOT NULL DEFAULT 'primary',
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
  KEY `idx_happy_customers_stats_status_sort` (`status`, `sort_order`),
  KEY `idx_happy_customers_stats_locale` (`locale`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `happy_customers_sections` (
  `id`, `title`, `subtitle`, `paragraph1`, `paragraph2`,
  `image_url`, `image_alt`, `badge_value`, `badge_label`,
  `status`, `locale`, `created_by_user_id`
) VALUES (
  '00000000-0000-4000-8000-00000000c001',
  'Clients Satisfaits',
  'La satisfaction de nos voyageurs est notre priorité absolue.',
  'Depuis notre lancement, nous avons accompagné des milliers de voyageurs dans la découverte de l''Afrique. Notre engagement envers un service d''excellence et des expériences authentiques nous a valu la confiance de notre communauté grandissante.',
  'Chaque retour positif nous motive à continuer d''améliorer nos services et à proposer des voyages toujours plus mémorables à travers le continent.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/A_giraffe_with_a_beautiful_background_of_Nairobi_City_Skyline_%28cropped%29.jpg/1280px-A_giraffe_with_a_beautiful_background_of_Nairobi_City_Skyline_%28cropped%29.jpg',
  'Voyageurs heureux en Afrique',
  '10K+',
  'Clients',
  'published',
  'fr',
  '00000000-0000-4000-8000-000000000010'
)
ON DUPLICATE KEY UPDATE
  `title` = VALUES(`title`),
  `subtitle` = VALUES(`subtitle`),
  `paragraph1` = VALUES(`paragraph1`),
  `paragraph2` = VALUES(`paragraph2`),
  `image_url` = VALUES(`image_url`),
  `image_alt` = VALUES(`image_alt`),
  `badge_value` = VALUES(`badge_value`),
  `badge_label` = VALUES(`badge_label`),
  `status` = VALUES(`status`);

INSERT INTO `happy_customers_stats` (
  `id`, `label`, `percent_value`, `color_key`, `sort_order`,
  `status`, `locale`, `created_by_user_id`
) VALUES
(
  '00000000-0000-4000-8000-00000000c101',
  'Vols',
  94,
  'primary',
  1,
  'published',
  'fr',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000c102',
  'Hôtels',
  87,
  'secondary',
  2,
  'published',
  'fr',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000c103',
  'Voitures',
  48,
  'primary',
  3,
  'published',
  'fr',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000c104',
  'Croisières',
  51,
  'secondary',
  4,
  'published',
  'fr',
  '00000000-0000-4000-8000-000000000010'
)
ON DUPLICATE KEY UPDATE
  `label` = VALUES(`label`),
  `percent_value` = VALUES(`percent_value`),
  `color_key` = VALUES(`color_key`),
  `sort_order` = VALUES(`sort_order`),
  `status` = VALUES(`status`);
