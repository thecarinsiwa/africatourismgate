-- Legal pages (terms of use, extensible for privacy later)
CREATE TABLE IF NOT EXISTS `legal_pages` (
  `id` CHAR(36) NOT NULL,
  `section_key` ENUM('terms-of-use') NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `content` LONGTEXT NOT NULL,
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
  UNIQUE KEY `uk_legal_pages_section_locale` (`section_key`, `locale`),
  KEY `idx_legal_pages_status_published` (`status`, `published_at`),
  KEY `idx_legal_pages_locale` (`locale`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed: French terms of use (draft, idempotent)
INSERT INTO `legal_pages` (
  `id`, `section_key`, `title`, `content`,
  `status`, `published_at`, `locale`, `created_by_user_id`
) VALUES
(
  '00000000-0000-4000-8000-00000000c001',
  'terms-of-use',
  'Conditions d''utilisation',
  '<p>Les présentes conditions d''utilisation régissent l''accès et l''utilisation de la plateforme Africa Tourism Gate.</p><p>En créant un compte, vous acceptez ces conditions. Le contenu détaillé sera mis à jour par l''équipe éditoriale.</p>',
  'draft',
  NULL,
  'fr',
  '00000000-0000-4000-8000-000000000010'
)
ON DUPLICATE KEY UPDATE
  `title` = VALUES(`title`),
  `content` = VALUES(`content`);
