-- Help center CMS: categories (parent) + localized title/description
-- Contract: docs/help-center-cms-contract.md
-- Seed of the 5 public themes is deferred to a later migration/script.

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `help_categories` (
  `id` CHAR(36) NOT NULL,
  `slug` VARCHAR(64) NOT NULL,
  `icon` ENUM('calendar', 'card', 'user', 'shield', 'message') NOT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `status` ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
  `published_at` DATETIME DEFAULT NULL,
  `created_by_user_id` CHAR(36) DEFAULT NULL,
  `updated_by_user_id` CHAR(36) DEFAULT NULL,
  `deleted_by_user_id` CHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_help_categories_slug` (`slug`),
  KEY `idx_help_categories_status_sort` (`status`, `sort_order`),
  KEY `idx_help_categories_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_help_categories_created_by` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_help_categories_updated_by` FOREIGN KEY (`updated_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_help_categories_deleted_by` FOREIGN KEY (`deleted_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `help_category_translations` (
  `id` CHAR(36) NOT NULL,
  `category_id` CHAR(36) NOT NULL,
  `locale` VARCHAR(5) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `created_by_user_id` CHAR(36) DEFAULT NULL,
  `updated_by_user_id` CHAR(36) DEFAULT NULL,
  `deleted_by_user_id` CHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_help_category_translations_category_locale` (`category_id`, `locale`),
  KEY `idx_help_category_translations_locale` (`locale`),
  KEY `idx_help_category_translations_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_help_category_translations_category` FOREIGN KEY (`category_id`) REFERENCES `help_categories` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_help_category_translations_created_by` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_help_category_translations_updated_by` FOREIGN KEY (`updated_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_help_category_translations_deleted_by` FOREIGN KEY (`deleted_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
