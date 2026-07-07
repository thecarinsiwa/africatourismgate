-- Campagnes de don (plateforme + GAP) — une seule mise en avant navbar par locale

CREATE TABLE IF NOT EXISTS `donations` (
  `id` CHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `context_note` VARCHAR(255) DEFAULT NULL COMMENT 'Contexte / circonstances (ex. urgence, saison des pluies)',
  `button_label` VARCHAR(120) NOT NULL,
  `url` VARCHAR(512) NOT NULL,
  `locale` VARCHAR(5) NOT NULL DEFAULT 'fr',
  `show_on_web` TINYINT(1) NOT NULL DEFAULT 1,
  `show_on_gap` TINYINT(1) NOT NULL DEFAULT 1,
  `is_navbar_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `status` ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_by_user_id` CHAR(36) DEFAULT NULL,
  `updated_by_user_id` CHAR(36) DEFAULT NULL,
  `deleted_by_user_id` CHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_donations_locale_status` (`locale`, `status`),
  KEY `idx_donations_navbar_featured` (`locale`, `is_navbar_featured`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
