-- Blog article engagement: reactions + comments (authenticated users)

CREATE TABLE IF NOT EXISTS `blog_post_reactions` (
  `id` CHAR(36) NOT NULL,
  `blog_post_id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `reaction_type` ENUM('like', 'love', 'clap', 'wow') NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_blog_reactions_post_user` (`blog_post_id`, `user_id`),
  KEY `idx_blog_reactions_post_type` (`blog_post_id`, `reaction_type`),
  CONSTRAINT `fk_blog_reactions_post`
    FOREIGN KEY (`blog_post_id`) REFERENCES `blog_posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_blog_reactions_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `blog_comments` (
  `id` CHAR(36) NOT NULL,
  `blog_post_id` CHAR(36) NOT NULL,
  `author_name` VARCHAR(120) NOT NULL,
  `author_email` VARCHAR(255) DEFAULT NULL,
  `body` TEXT NOT NULL,
  `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'approved',
  `created_by_user_id` CHAR(36) DEFAULT NULL,
  `updated_by_user_id` CHAR(36) DEFAULT NULL,
  `deleted_by_user_id` CHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_blog_comments_post_status` (`blog_post_id`, `status`, `created_at`),
  KEY `idx_blog_comments_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_blog_comments_post`
    FOREIGN KEY (`blog_post_id`) REFERENCES `blog_posts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
