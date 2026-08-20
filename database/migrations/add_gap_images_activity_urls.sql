-- Multiple images for GAP activities (max 10 enforced in API).
-- Must sort AFTER add_gap_content.sql under Node localeCompare (see db-sync.mjs).
-- Keeps image_url as the cover (first URL) for public API compatibility.

SET @has_table := (
  SELECT COUNT(*)
  FROM information_schema.TABLES
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'gap_activities'
);

SET @has_column := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'gap_activities'
    AND COLUMN_NAME = 'image_urls'
);

SET @ddl := IF(
  @has_table > 0 AND @has_column = 0,
  'ALTER TABLE `gap_activities` ADD COLUMN `image_urls` JSON NULL AFTER `image_url`',
  'SELECT 1'
);

PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @backfill := IF(
  @has_table > 0,
  'UPDATE `gap_activities` SET `image_urls` = JSON_ARRAY(`image_url`) WHERE `image_url` IS NOT NULL AND TRIM(`image_url`) <> '''' AND (`image_urls` IS NULL OR JSON_LENGTH(`image_urls`) = 0)',
  'SELECT 1'
);

PREPARE stmt FROM @backfill;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
