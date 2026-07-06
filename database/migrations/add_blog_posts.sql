-- Blog posts for public marketing site
CREATE TABLE IF NOT EXISTS `blog_posts` (
  `id` CHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(180) NOT NULL,
  `excerpt` TEXT DEFAULT NULL,
  `content` LONGTEXT NOT NULL,
  `cover_image_url` VARCHAR(512) DEFAULT NULL,
  `status` ENUM('draft','published') NOT NULL DEFAULT 'draft',
  `published_at` DATETIME DEFAULT NULL,
  `locale` VARCHAR(5) NOT NULL DEFAULT 'fr',
  `created_by_user_id` CHAR(36) DEFAULT NULL,
  `updated_by_user_id` CHAR(36) DEFAULT NULL,
  `deleted_by_user_id` CHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_blog_posts_slug` (`slug`),
  KEY `idx_blog_posts_status_published` (`status`, `published_at`),
  KEY `idx_blog_posts_locale` (`locale`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `blog_posts` (
  `id`, `title`, `slug`, `excerpt`, `content`, `cover_image_url`,
  `status`, `published_at`, `locale`, `created_by_user_id`
) VALUES
(
  '00000000-0000-4000-8000-00000000b001',
  'Découvrir le Kenya : Masai Mara et au-delà',
  'decouvrir-kenya-masai-mara',
  'Safaris, paysages et conseils pratiques pour préparer votre première visite au Kenya.',
  '<p>Le Kenya reste l''une des destinations phares d''Afrique de l''Est. Entre la réserve du Masai Mara, les plages de Diani et la capitale Nairobi, chaque voyageur y trouve son rythme.</p><p>Pour un premier safari, privilégiez la saison sèche (juin à octobre) afin d''optimiser les observations. Réservez tôt les lodges et les transferts aériens internes.</p>',
  NULL,
  'published',
  '2026-05-15 10:00:00',
  'fr',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000b002',
  'Zanzibar : guide des plages et de Stone Town',
  'zanzibar-plages-stone-town',
  'Entre l''océan Indien turquoise et l''histoire swahilie, Zanzibar séduit toute l''année.',
  '<p>Stone Town, classée au patrimoine mondial, mérite deux jours de visite. Les plages du nord (Nungwi, Kendwa) conviennent à la baignade ; le sud est plus calme.</p><p>Combinez votre séjour avec un safari en Tanzanie continentale pour une expérience complète.</p>',
  NULL,
  'published',
  '2026-05-20 09:30:00',
  'fr',
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-00000000b003',
  'Voyager en RDC : Kinshasa et les trésors naturels',
  'voyager-rdc-kinshasa',
  'Conseils logistiques et idées d''itinéraires pour explorer la République démocratique du Congo.',
  '<p>Kinshasa, capitale vibrante, est la porte d''entrée idéale. Au-delà de la ville, les parcs nationaux offrent une biodiversité exceptionnelle.</p><p>Anticipez les formalités de visa et travaillez avec des opérateurs locaux agréés pour les excursions en province.</p>',
  NULL,
  'published',
  '2026-06-01 14:00:00',
  'fr',
  '00000000-0000-4000-8000-000000000010'
)
ON DUPLICATE KEY UPDATE
  `title` = VALUES(`title`),
  `excerpt` = VALUES(`excerpt`),
  `content` = VALUES(`content`),
  `status` = VALUES(`status`),
  `published_at` = VALUES(`published_at`);
