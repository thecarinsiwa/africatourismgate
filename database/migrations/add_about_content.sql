-- Institutional About section: text pages, team members, downloadable resources
CREATE TABLE IF NOT EXISTS `about_pages` (
  `id` CHAR(36) NOT NULL,
  `section_key` ENUM('who-we-are', 'how-we-work', 'governance', 'responsibility') NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `excerpt` TEXT DEFAULT NULL,
  `content` LONGTEXT NOT NULL,
  `cover_image_url` VARCHAR(512) DEFAULT NULL,
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
  UNIQUE KEY `uk_about_pages_section_locale` (`section_key`, `locale`),
  KEY `idx_about_pages_status_published` (`status`, `published_at`),
  KEY `idx_about_pages_locale` (`locale`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `team_members` (
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(120) NOT NULL,
  `role` VARCHAR(160) NOT NULL,
  `bio` TEXT DEFAULT NULL,
  `photo_url` VARCHAR(512) DEFAULT NULL,
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
  KEY `idx_team_members_status_sort` (`status`, `sort_order`),
  KEY `idx_team_members_locale` (`locale`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `about_resources` (
  `id` CHAR(36) NOT NULL,
  `type` ENUM('financial', 'media') NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `file_url` VARCHAR(512) DEFAULT NULL,
  `external_url` VARCHAR(512) DEFAULT NULL,
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
  KEY `idx_about_resources_type_status` (`type`, `status`, `sort_order`),
  KEY `idx_about_resources_locale` (`locale`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed: French institutional content (idempotent)
INSERT INTO `about_pages` (
  `id`, `section_key`, `title`, `excerpt`, `content`, `cover_image_url`,
  `status`, `published_at`, `locale`, `created_by_user_id`
) VALUES
(
  '00000000-0000-4000-8000-00000000a001',
  'who-we-are',
  'Qui nous sommes',
  'Africa Tourism Gate connecte les voyageurs aux meilleures expériences du continent africain.',
  '<p>Africa Tourism Gate est une plateforme de réservation et d''accompagnement dédiée au tourisme en Afrique. Notre mission est de rendre les voyages plus accessibles, plus sûrs et plus authentiques, en reliant les voyageurs à des partenaires locaux vérifiés.</p><p>Fondée à Kinshasa, nous couvrons progressivement l''ensemble du continent grâce à un réseau d''hébergements, d''activités, de guides et de services de transport.</p>',
  NULL,
  'published',
  '2026-06-01 10:00:00',
  'fr',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000a002',
  'how-we-work',
  'Comment nous travaillons',
  'Une approche centrée sur la qualité, la transparence et le partenariat local.',
  '<p>Nous sélectionnons nos partenaires selon des critères stricts : qualité de service, sécurité, respect de l''environnement et impact positif sur les communautés locales.</p><p>Chaque réservation est suivie de bout en bout : confirmation, assistance voyage et support client disponible avant, pendant et après le séjour.</p><p>Notre équipe travaille en étroite collaboration avec les opérateurs sur le terrain pour garantir des expériences cohérentes et mémorables.</p>',
  NULL,
  'published',
  '2026-06-01 10:00:00',
  'fr',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000a003',
  'governance',
  'Notre gouvernance',
  'Une structure de gouvernance transparente au service de nos utilisateurs et partenaires.',
  '<p>Africa Tourism Gate est dirigée par un conseil d''administration et une direction opérationnelle responsables de la stratégie, de la conformité et de la qualité de service.</p><p>Les décisions majeures — politique tarifaire, partenariats stratégiques, standards de sécurité — sont prises de manière collégiale et documentées.</p><p>Nous publions régulièrement nos rapports d''activité et nos indicateurs clés pour assurer la transparence envers nos parties prenantes.</p>',
  NULL,
  'published',
  '2026-06-01 10:00:00',
  'fr',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000a004',
  'responsibility',
  'Responsabilité',
  'Un engagement fort pour un tourisme durable et responsable.',
  '<p>Nous croyons que le tourisme peut être un levier de développement économique et de préservation culturelle lorsqu''il est pratiqué de manière responsable.</p><p>Nos engagements : favoriser l''économie locale, réduire l''empreinte environnementale de nos opérations, promouvoir le respect des communautés et des écosystèmes, et garantir des conditions de travail équitables pour nos partenaires.</p><p>Nous améliorons continuellement nos pratiques en concertation avec les acteurs du secteur et nos voyageurs.</p>',
  NULL,
  'published',
  '2026-06-01 10:00:00',
  'fr',
  '00000000-0000-4000-8000-000000000010'
)
ON DUPLICATE KEY UPDATE
  `title` = VALUES(`title`),
  `excerpt` = VALUES(`excerpt`),
  `content` = VALUES(`content`),
  `status` = VALUES(`status`),
  `published_at` = VALUES(`published_at`);

INSERT INTO `team_members` (
  `id`, `name`, `role`, `bio`, `photo_url`, `sort_order`,
  `status`, `locale`, `created_by_user_id`
) VALUES
(
  '00000000-0000-4000-8000-00000000a101',
  'Marie Kabila',
  'Directrice générale',
  'Plus de 15 ans d''expérience dans le tourisme et l''hospitalité en Afrique centrale. Marie pilote la vision stratégique d''Africa Tourism Gate.',
  NULL,
  1,
  'published',
  'fr',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000a102',
  'Jean-Pierre Mwamba',
  'Directeur des opérations',
  'Expert en logistique voyage et gestion de partenariats. Jean-Pierre coordonne le réseau d''opérateurs et la qualité de service.',
  NULL,
  2,
  'published',
  'fr',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000a103',
  'Amina Diallo',
  'Responsable expérience client',
  'Passionnée par l''accueil et la satisfaction voyageur, Amina supervise le support client et l''amélioration continue de l''expérience utilisateur.',
  NULL,
  3,
  'published',
  'fr',
  '00000000-0000-4000-8000-000000000010'
)
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `role` = VALUES(`role`),
  `bio` = VALUES(`bio`),
  `sort_order` = VALUES(`sort_order`),
  `status` = VALUES(`status`);

INSERT INTO `about_resources` (
  `id`, `type`, `title`, `description`, `file_url`, `external_url`,
  `published_at`, `sort_order`, `status`, `locale`, `created_by_user_id`
) VALUES
(
  '00000000-0000-4000-8000-00000000a201',
  'financial',
  'Rapport d''activité 2025',
  'Synthèse des indicateurs financiers et opérationnels de l''exercice 2025.',
  NULL,
  NULL,
  '2026-01-15 09:00:00',
  1,
  'published',
  'fr',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000a202',
  'media',
  'Kit presse Africa Tourism Gate',
  'Logos, visuels et éléments de langage pour les médias et partenaires.',
  NULL,
  NULL,
  '2026-03-01 09:00:00',
  1,
  'published',
  'fr',
  '00000000-0000-4000-8000-000000000010'
)
ON DUPLICATE KEY UPDATE
  `title` = VALUES(`title`),
  `description` = VALUES(`description`),
  `published_at` = VALUES(`published_at`),
  `sort_order` = VALUES(`sort_order`),
  `status` = VALUES(`status`);
