-- Gorilla Ambassadors Program (GAP) — site vitrine CMS tables + seed FR initial

CREATE TABLE IF NOT EXISTS `gap_site_settings` (
  `id` CHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `subtitle` TEXT NOT NULL,
  `hero_image_url` VARCHAR(1024) NOT NULL,
  `hero_image_alt` VARCHAR(255) NOT NULL,
  `unesco_label` VARCHAR(160) DEFAULT NULL,
  `unesco_url` VARCHAR(512) DEFAULT NULL,
  `links` JSON DEFAULT NULL,
  `status` ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
  `locale` VARCHAR(5) NOT NULL DEFAULT 'fr',
  `created_by_user_id` CHAR(36) DEFAULT NULL,
  `updated_by_user_id` CHAR(36) DEFAULT NULL,
  `deleted_by_user_id` CHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_gap_site_settings_locale` (`locale`),
  KEY `idx_gap_site_settings_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `gap_pages` (
  `id` CHAR(36) NOT NULL,
  `section_key` ENUM('about', 'objectives', 'unesco') NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `excerpt` TEXT DEFAULT NULL,
  `content` LONGTEXT NOT NULL,
  `cover_image_url` VARCHAR(512) DEFAULT NULL,
  `cover_image_urls` JSON DEFAULT NULL,
  `status` ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
  `published_at` DATETIME DEFAULT NULL,
  `locale` VARCHAR(5) NOT NULL DEFAULT 'fr',
  `created_by_user_id` CHAR(36) DEFAULT NULL,
  `updated_by_user_id` CHAR(36) DEFAULT NULL,
  `deleted_by_user_id` CHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_gap_pages_section_locale` (`section_key`, `locale`),
  KEY `idx_gap_pages_status_published` (`status`, `published_at`),
  KEY `idx_gap_pages_locale` (`locale`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `gap_activities` (
  `id` CHAR(36) NOT NULL,
  `title` VARCHAR(160) NOT NULL,
  `description` TEXT NOT NULL,
  `icon_key` ENUM('school', 'tree', 'art', 'park', 'community') NOT NULL DEFAULT 'school',
  `image_url` VARCHAR(1024) DEFAULT NULL,
  `image_urls` JSON DEFAULT NULL,
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
  KEY `idx_gap_activities_status_sort` (`status`, `sort_order`),
  KEY `idx_gap_activities_locale` (`locale`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `gap_impact_stats` (
  `id` CHAR(36) NOT NULL,
  `label` VARCHAR(120) NOT NULL,
  `value_display` VARCHAR(64) NOT NULL,
  `description` TEXT DEFAULT NULL,
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
  KEY `idx_gap_impact_stats_status_sort` (`status`, `sort_order`),
  KEY `idx_gap_impact_stats_locale` (`locale`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `gap_media_items` (
  `id` CHAR(36) NOT NULL,
  `media_type` ENUM('image', 'video') NOT NULL DEFAULT 'image',
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `file_url` VARCHAR(512) DEFAULT NULL,
  `external_url` VARCHAR(512) DEFAULT NULL,
  `thumbnail_url` VARCHAR(512) DEFAULT NULL,
  `published_at` DATETIME DEFAULT NULL,
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
  KEY `idx_gap_media_items_type_status` (`media_type`, `status`, `sort_order`),
  KEY `idx_gap_media_items_locale` (`locale`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed: paramètres du site GAP
INSERT INTO `gap_site_settings` (
  `id`, `title`, `subtitle`, `hero_image_url`, `hero_image_alt`,
  `unesco_label`, `unesco_url`, `status`, `locale`, `created_by_user_id`
) VALUES (
  '00000000-0000-4000-8000-00000000d001',
  'Gorilla Ambassadors Program',
  'Initiative congolaise d''éducation environnementale pour protéger les gorilles de montagne et promouvoir la conservation de la biodiversité au Parc national des Virunga et dans d''autres parcs.',
  'https://upload.wikimedia.org/wikipedia/commons/d/de/Mountain_gorilla_from_Susa_Group_in_Karisimbi_thicket_of_Volcanoes_National_Park_in_Rwanda._Emmanuel_Kwizera.jpg',
  'Gorille de montagne dans la forêt du Parc national des Virunga',
  'Reconnu par l''UNESCO — Green Citizens',
  'https://en.unesco.org/green-citizens',
  'published',
  'fr',
  '00000000-0000-4000-8000-000000000010'
)
ON DUPLICATE KEY UPDATE
  `title` = VALUES(`title`),
  `subtitle` = VALUES(`subtitle`),
  `hero_image_url` = VALUES(`hero_image_url`),
  `hero_image_alt` = VALUES(`hero_image_alt`),
  `unesco_label` = VALUES(`unesco_label`),
  `unesco_url` = VALUES(`unesco_url`),
  `status` = VALUES(`status`);

-- Seed: pages institutionnelles
INSERT INTO `gap_pages` (
  `id`, `section_key`, `title`, `excerpt`, `content`, `cover_image_url`,
  `status`, `published_at`, `locale`, `created_by_user_id`
) VALUES
(
  '00000000-0000-4000-8000-00000000d101',
  'about',
  'Le programme',
  'Créé en 2019 par de jeunes environnementalistes de Congo Tourism Gate, le GAP sensibilise les communautés autour du Parc national des Virunga.',
  '<p>Le <strong>Gorilla Ambassadors Program (GAP)</strong> est un programme d''éducation environnementale créé en 2019 en République démocratique du Congo. Il est porté par l''association locale <strong>Congo Tourism Gate</strong>.</p><p>Son objectif principal est de contribuer à la conservation des gorilles de montagne et de leur habitat dans le <strong>Parc national des Virunga</strong>, site classé au patrimoine mondial de l''UNESCO, ainsi que dans d''autres parcs de la région.</p><p>Face aux menaces qui pèsent sur le parc — braconnage, conflits armés, destruction de l''habitat — le programme agit en impliquant directement les populations riveraines, en particulier les jeunes, pour construire une culture de protection de la biodiversité.</p>',
  NULL,
  'published',
  '2019-01-01 10:00:00',
  'fr',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000d102',
  'objectives',
  'Nos objectifs',
  'Éduquer, former et réduire les pressions sur le parc grâce à l''engagement des communautés locales.',
  '<p>Le Gorilla Ambassadors Program poursuit trois objectifs complémentaires :</p><ul><li><strong>Éduquer et sensibiliser</strong> les communautés locales, en particulier les jeunes, à l''importance de la conservation de la biodiversité.</li><li><strong>Former la prochaine génération</strong> de gardes et de défenseurs de l''environnement capables de protéger les écosystèmes forestiers.</li><li><strong>Réduire les pressions</strong> exercées sur le parc, comme le braconnage et la déforestation, en impliquant activement les populations riveraines dans des actions concrètes de préservation.</li></ul>',
  NULL,
  'published',
  '2019-01-01 10:00:00',
  'fr',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000d103',
  'unesco',
  'Reconnaissance UNESCO',
  'Le programme a été mis en lumière par l''UNESCO dans le cadre de son initiative Green Citizens.',
  '<p>Les résultats du Gorilla Ambassadors Program ont attiré l''attention de la communauté internationale. Le programme a été <strong>mis en lumière par l''UNESCO</strong> dans le cadre de son initiative <em>Green Citizens</em>, qui valorise les citoyens et les organisations qui agissent concrètement pour la protection de l''environnement.</p><p>Cette reconnaissance confirme l''impact positif du GAP sur la conservation des gorilles de montagne et sur l''implication des communautés locales autour du Parc national des Virunga.</p>',
  NULL,
  'published',
  '2024-06-01 10:00:00',
  'fr',
  '00000000-0000-4000-8000-000000000010'
)
ON DUPLICATE KEY UPDATE
  `title` = VALUES(`title`),
  `excerpt` = VALUES(`excerpt`),
  `content` = VALUES(`content`),
  `status` = VALUES(`status`),
  `published_at` = VALUES(`published_at`);

-- Seed: activités du programme
INSERT INTO `gap_activities` (
  `id`, `title`, `description`, `icon_key`, `image_url`, `sort_order`,
  `status`, `locale`, `created_by_user_id`
) VALUES
(
  '00000000-0000-4000-8000-00000000d201',
  'Sensibilisation des écoliers',
  'Des ateliers sont organisés dans les écoles pour sensibiliser les enfants de 6 à 14 ans à la protection de la biodiversité et au rôle des gorilles dans l''écosystème.',
  'school',
  NULL,
  1,
  'published',
  'fr',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000d202',
  'Activités pratiques de reboisement',
  'Organisation de campagnes de reboisement dans les zones dégradées du parc et dans les cours d''école pour restaurer les habitats forestiers.',
  'tree',
  NULL,
  2,
  'published',
  'fr',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000d203',
  'Expression artistique et narration',
  'Des ateliers créatifs et de narration sont proposés pour promouvoir la culture locale et impliquer les communautés dans la transmission des valeurs de conservation.',
  'art',
  NULL,
  3,
  'published',
  'fr',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000d204',
  'Visites du parc',
  'Des sorties éducatives sont organisées pour permettre aux enfants et aux chefs d''école de découvrir les gorilles de montagne et de comprendre les enjeux de leur protection.',
  'park',
  NULL,
  4,
  'published',
  'fr',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000d205',
  'Campagnes communautaires',
  'Des actions de sensibilisation sont menées dans les régions autour du parc pour mobiliser les riverains contre le braconnage et les activités destructrices.',
  'community',
  NULL,
  5,
  'published',
  'fr',
  '00000000-0000-4000-8000-000000000010'
)
ON DUPLICATE KEY UPDATE
  `title` = VALUES(`title`),
  `description` = VALUES(`description`),
  `icon_key` = VALUES(`icon_key`),
  `sort_order` = VALUES(`sort_order`),
  `status` = VALUES(`status`);

-- Seed: statistiques d'impact
INSERT INTO `gap_impact_stats` (
  `id`, `label`, `value_display`, `description`, `color_key`, `sort_order`,
  `status`, `locale`, `created_by_user_id`
) VALUES
(
  '00000000-0000-4000-8000-00000000d301',
  'Participants sensibilisés',
  '2 500+',
  'Jeunes et riverains ont participé aux activités du programme depuis sa création.',
  'primary',
  1,
  'published',
  'fr',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000d302',
  'Croissance des gorilles',
  '4,7 %',
  'Taux de croissance annuel de la population de gorilles de montagne (contre 3 % estimé naturellement).',
  'secondary',
  2,
  'published',
  'fr',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000d303',
  'Braconnage',
  'En baisse',
  'Le taux de braconnage a significativement diminué grâce à l''implication des communautés locales.',
  'primary',
  3,
  'published',
  'fr',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000d304',
  'Communautés engagées',
  'Impliquées',
  'Les populations riveraines participent activement à la protection du site et ont abandonné certaines pratiques destructrices, comme la consommation de viande de brousse.',
  'secondary',
  4,
  'published',
  'fr',
  '00000000-0000-4000-8000-000000000010'
)
ON DUPLICATE KEY UPDATE
  `label` = VALUES(`label`),
  `value_display` = VALUES(`value_display`),
  `description` = VALUES(`description`),
  `color_key` = VALUES(`color_key`),
  `sort_order` = VALUES(`sort_order`),
  `status` = VALUES(`status`);

-- Seed: médias (placeholders — URLs à compléter via l'admin)
INSERT INTO `gap_media_items` (
  `id`, `media_type`, `title`, `description`, `file_url`, `external_url`,
  `thumbnail_url`, `published_at`, `sort_order`, `status`, `locale`, `created_by_user_id`
) VALUES
(
  '00000000-0000-4000-8000-00000000d401',
  'image',
  'Atelier de sensibilisation en école',
  'Des enfants participent à un atelier d''éducation environnementale organisé par le GAP.',
  NULL,
  NULL,
  'https://upload.wikimedia.org/wikipedia/commons/d/de/Mountain_gorilla_from_Susa_Group_in_Karisimbi_thicket_of_Volcanoes_National_Park_in_Rwanda._Emmanuel_Kwizera.jpg',
  '2024-01-15 09:00:00',
  1,
  'published',
  'fr',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000d402',
  'image',
  'Campagne de reboisement',
  'Plantation d''arbres dans une zone dégradée autour du Parc national des Virunga.',
  NULL,
  NULL,
  NULL,
  '2024-03-01 09:00:00',
  2,
  'published',
  'fr',
  '00000000-0000-4000-8000-000000000010'
)
ON DUPLICATE KEY UPDATE
  `title` = VALUES(`title`),
  `description` = VALUES(`description`),
  `thumbnail_url` = VALUES(`thumbnail_url`),
  `published_at` = VALUES(`published_at`),
  `sort_order` = VALUES(`sort_order`),
  `status` = VALUES(`status`);
