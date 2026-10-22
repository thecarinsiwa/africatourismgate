-- Review source (platform | tripadvisor), nullable user_id, external author name.
-- Also extends entity_type with 'tripadvisor' for manual homepage Tripadvisor reviews
-- (entity_id = review id so uq_reviews_entity stays unique).
-- Idempotent for CI / re-runs.

-- 1) Drop FK so user_id can become nullable
SET @sql = IF(
  (
    SELECT COUNT(*)
    FROM information_schema.table_constraints
    WHERE table_schema = DATABASE()
      AND table_name = 'reviews'
      AND constraint_name = 'fk_reviews_user'
      AND constraint_type = 'FOREIGN KEY'
  ) > 0,
  'ALTER TABLE `reviews` DROP FOREIGN KEY `fk_reviews_user`',
  'SELECT ''fk_reviews_user already absent'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2) Nullable user_id (Tripadvisor has no platform account)
ALTER TABLE `reviews`
  MODIFY COLUMN `user_id` CHAR(36) DEFAULT NULL;

-- 3) Recreate FK with ON DELETE SET NULL
SET @sql = IF(
  (
    SELECT COUNT(*)
    FROM information_schema.table_constraints
    WHERE table_schema = DATABASE()
      AND table_name = 'reviews'
      AND constraint_name = 'fk_reviews_user'
      AND constraint_type = 'FOREIGN KEY'
  ) = 0,
  'ALTER TABLE `reviews` ADD CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL',
  'SELECT ''fk_reviews_user already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4) source column
SET @sql = IF(
  (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'reviews'
      AND column_name = 'source'
  ) = 0,
  'ALTER TABLE `reviews` ADD COLUMN `source` ENUM(''platform'',''tripadvisor'') NOT NULL DEFAULT ''platform'' AFTER `user_id`',
  'SELECT ''reviews.source already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 5) external_author_name
SET @sql = IF(
  (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'reviews'
      AND column_name = 'external_author_name'
  ) = 0,
  'ALTER TABLE `reviews` ADD COLUMN `external_author_name` VARCHAR(120) DEFAULT NULL AFTER `body`',
  'SELECT ''reviews.external_author_name already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 6) entity_type includes tripadvisor
ALTER TABLE `reviews`
  MODIFY COLUMN `entity_type` ENUM(
    'property',
    'flight',
    'vehicle',
    'cruise',
    'activity',
    'booking',
    'tour_guide',
    'tripadvisor'
  ) NOT NULL;

-- 7) Index on source (homepage featured filter)
SET @sql = IF(
  (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'reviews'
      AND index_name = 'idx_reviews_source'
  ) = 0,
  'ALTER TABLE `reviews` ADD KEY `idx_reviews_source` (`source`)',
  'SELECT ''idx_reviews_source already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE `reviews` SET `source` = 'platform' WHERE `source` IS NULL OR `source` = '';
