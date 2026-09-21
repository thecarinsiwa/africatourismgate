-- Help center CMS: articles + translations + ordered related links
-- Depends on: add_help_categories.sql
-- Contract: docs/help-center-cms-contract.md
-- Seed of the 22 public articles is deferred to a later migration/script.

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `help_articles` (
  `id` CHAR(36) NOT NULL,
  `category_id` CHAR(36) NOT NULL,
  `slug` VARCHAR(64) NOT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_popular` TINYINT(1) NOT NULL DEFAULT 0,
  `status` ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
  `published_at` DATETIME DEFAULT NULL,
  `created_by_user_id` CHAR(36) DEFAULT NULL,
  `updated_by_user_id` CHAR(36) DEFAULT NULL,
  `deleted_by_user_id` CHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_help_articles_slug` (`slug`),
  KEY `idx_help_articles_category` (`category_id`),
  KEY `idx_help_articles_category_sort` (`category_id`, `sort_order`),
  KEY `idx_help_articles_status_popular` (`status`, `is_popular`),
  KEY `idx_help_articles_status_published` (`status`, `published_at`),
  KEY `idx_help_articles_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_help_articles_category` FOREIGN KEY (`category_id`) REFERENCES `help_categories` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_help_articles_created_by` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_help_articles_updated_by` FOREIGN KEY (`updated_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_help_articles_deleted_by` FOREIGN KEY (`deleted_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `help_article_translations` (
  `id` CHAR(36) NOT NULL,
  `article_id` CHAR(36) NOT NULL,
  `locale` VARCHAR(5) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `summary` TEXT NOT NULL,
  `body` LONGTEXT NOT NULL,
  `created_by_user_id` CHAR(36) DEFAULT NULL,
  `updated_by_user_id` CHAR(36) DEFAULT NULL,
  `deleted_by_user_id` CHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_help_article_translations_article_locale` (`article_id`, `locale`),
  KEY `idx_help_article_translations_locale` (`locale`),
  KEY `idx_help_article_translations_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_help_article_translations_article` FOREIGN KEY (`article_id`) REFERENCES `help_articles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_help_article_translations_created_by` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_help_article_translations_updated_by` FOREIGN KEY (`updated_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_help_article_translations_deleted_by` FOREIGN KEY (`deleted_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ordered related articles (replaces catalog relatedSlugs; max 5 enforced in app)
CREATE TABLE IF NOT EXISTS `help_article_related` (
  `article_id` CHAR(36) NOT NULL,
  `related_article_id` CHAR(36) NOT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_by_user_id` CHAR(36) DEFAULT NULL,
  `updated_by_user_id` CHAR(36) DEFAULT NULL,
  `deleted_by_user_id` CHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`article_id`, `related_article_id`),
  KEY `idx_help_article_related_target` (`related_article_id`),
  KEY `idx_help_article_related_sort` (`article_id`, `sort_order`),
  KEY `idx_help_article_related_deleted_at` (`deleted_at`),
  CONSTRAINT `chk_help_article_related_not_self` CHECK (`article_id` <> `related_article_id`),
  CONSTRAINT `fk_help_article_related_article` FOREIGN KEY (`article_id`) REFERENCES `help_articles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_help_article_related_target` FOREIGN KEY (`related_article_id`) REFERENCES `help_articles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_help_article_related_created_by` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_help_article_related_updated_by` FOREIGN KEY (`updated_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_help_article_related_deleted_by` FOREIGN KEY (`deleted_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
