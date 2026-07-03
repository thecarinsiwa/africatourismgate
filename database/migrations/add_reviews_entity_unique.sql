-- Livrable #39: one review per entity (defensive for fresh schema import)

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'reviews' AND index_name = 'idx_reviews_entity') > 0,
  'ALTER TABLE `reviews` DROP INDEX `idx_reviews_entity`',
  'SELECT ''idx_reviews_entity already absent'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'reviews' AND index_name = 'uq_reviews_entity') = 0,
  'ALTER TABLE `reviews` ADD UNIQUE KEY `uq_reviews_entity` (`entity_type`, `entity_id`)',
  'SELECT ''uq_reviews_entity already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
