-- Link blog reactions to authenticated users (replace visitor_key with user_id).
-- Idempotent for DBs that already ran add_blog_posts_engagement with visitor_key.

-- Drop legacy unique key on visitor_key
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'blog_post_reactions'
      AND index_name = 'uk_blog_reactions_post_visitor') > 0,
  'ALTER TABLE `blog_post_reactions` DROP INDEX `uk_blog_reactions_post_visitor`',
  'SELECT ''uk_blog_reactions_post_visitor absent'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add user_id if missing
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'blog_post_reactions'
      AND column_name = 'user_id') = 0,
  'ALTER TABLE `blog_post_reactions` ADD COLUMN `user_id` CHAR(36) NULL AFTER `blog_post_id`',
  'SELECT ''blog_post_reactions.user_id already present'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Anonymous visitor rows cannot be mapped — clear them before enforcing NOT NULL
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'blog_post_reactions'
      AND column_name = 'user_id') > 0,
  'DELETE FROM `blog_post_reactions` WHERE `user_id` IS NULL',
  'SELECT ''blog_post_reactions clear skipped'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Enforce NOT NULL on user_id
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'blog_post_reactions'
      AND column_name = 'user_id'
      AND is_nullable = 'YES') > 0,
  'ALTER TABLE `blog_post_reactions` MODIFY COLUMN `user_id` CHAR(36) NOT NULL',
  'SELECT ''blog_post_reactions.user_id already NOT NULL'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Unique (blog_post_id, user_id)
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'blog_post_reactions'
      AND index_name = 'uk_blog_reactions_post_user') = 0,
  'ALTER TABLE `blog_post_reactions` ADD UNIQUE KEY `uk_blog_reactions_post_user` (`blog_post_id`, `user_id`)',
  'SELECT ''uk_blog_reactions_post_user already present'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- FK to users
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.table_constraints
    WHERE table_schema = DATABASE()
      AND table_name = 'blog_post_reactions'
      AND constraint_name = 'fk_blog_reactions_user'
      AND constraint_type = 'FOREIGN KEY') = 0,
  'ALTER TABLE `blog_post_reactions`
     ADD CONSTRAINT `fk_blog_reactions_user`
     FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE',
  'SELECT ''fk_blog_reactions_user already present'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop visitor_key column if present
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'blog_post_reactions'
      AND column_name = 'visitor_key') > 0,
  'ALTER TABLE `blog_post_reactions` DROP COLUMN `visitor_key`',
  'SELECT ''blog_post_reactions.visitor_key already absent'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Comments: drop unused visitor_key (identity is created_by_user_id)
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'blog_comments'
      AND column_name = 'visitor_key') > 0,
  'ALTER TABLE `blog_comments` DROP COLUMN `visitor_key`',
  'SELECT ''blog_comments.visitor_key already absent'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
