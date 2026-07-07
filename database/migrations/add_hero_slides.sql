CREATE TABLE IF NOT EXISTS `hero_slides` (
  `id` CHAR(36) NOT NULL,
  `subtitle` VARCHAR(255) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `image_url` VARCHAR(1024) NOT NULL,
  `image_alt` VARCHAR(255) NOT NULL,
  `href` VARCHAR(512) DEFAULT NULL,
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
  KEY `idx_hero_slides_status_sort` (`status`, `sort_order`),
  KEY `idx_hero_slides_locale` (`locale`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `hero_slides` (
  `id`, `subtitle`, `title`, `description`, `image_url`, `image_alt`,
  `href`, `sort_order`, `status`, `locale`, `created_by_user_id`
) VALUES
(
  '00000000-0000-4000-8000-00000000c001',
  'Bienvenue chez',
  'AFRICA TOURISM GATE',
  'Votre passerelle vers les plus belles destinations africaines. Explorez, réservez et vivez des expériences inoubliables.',
  'https://upload.wikimedia.org/wikipedia/commons/d/de/Mountain_gorilla_from_Susa_Group_in_Karisimbi_thicket_of_Volcanoes_National_Park_in_Rwanda._Emmanuel_Kwizera.jpg',
  'Gorille de montagne au Rwanda',
  NULL,
  1,
  'published',
  'fr',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000c002',
  'Safari de 7 jours',
  'MASAI MARA MAGIQUE',
  'Découvrez la migration des gnous et les Big Five dans la réserve la plus célèbre d''Afrique.',
  'https://upload.wikimedia.org/wikipedia/commons/e/e8/Serengeti_sunset-1001.jpg',
  'Coucher de soleil sur la savane du Serengeti',
  '/hotels?destination=Masai%20Mara',
  2,
  'published',
  'fr',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000c003',
  '5 jours à',
  'MARRAKECH (Perle du Sud)',
  'Plongez dans les souks, les riads et les saveurs épicées de la ville ocre du Maroc.',
  'https://upload.wikimedia.org/wikipedia/commons/1/1b/Koutoubia_Mosque%2C_Marrakech.jpg',
  'Mosquée Koutoubia à Marrakech',
  '/hotels?destination=Marrakech',
  3,
  'published',
  'fr',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000c004',
  'Croisière de 12 jours',
  'ZANZIBAR À MADAGASCAR',
  'Navigation côtière le long de l''Océan Indien — plages de rêve et faune unique.',
  'https://upload.wikimedia.org/wikipedia/commons/6/6a/Zanzibar_beach.jpg',
  'Plage de Zanzibar',
  '/cruises',
  4,
  'published',
  'fr',
  '00000000-0000-4000-8000-000000000010'
)
ON DUPLICATE KEY UPDATE
  `subtitle` = VALUES(`subtitle`),
  `title` = VALUES(`title`),
  `description` = VALUES(`description`),
  `image_url` = VALUES(`image_url`),
  `image_alt` = VALUES(`image_alt`),
  `href` = VALUES(`href`),
  `sort_order` = VALUES(`sort_order`),
  `status` = VALUES(`status`);
