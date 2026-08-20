-- Multiple cover images for GAP pages (max 10 enforced in API).
-- Keeps cover_image_url as the cover (first URL) for public API compatibility.

SET @has_table := (
  SELECT COUNT(*)
  FROM information_schema.TABLES
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'gap_pages'
);

SET @has_column := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'gap_pages'
    AND COLUMN_NAME = 'cover_image_urls'
);

SET @ddl := IF(
  @has_table > 0 AND @has_column = 0,
  'ALTER TABLE `gap_pages` ADD COLUMN `cover_image_urls` JSON NULL AFTER `cover_image_url`',
  'SELECT 1'
);

PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @backfill := IF(
  @has_table > 0,
  'UPDATE `gap_pages` SET `cover_image_urls` = JSON_ARRAY(`cover_image_url`) WHERE `cover_image_url` IS NOT NULL AND TRIM(`cover_image_url`) <> '''' AND (`cover_image_urls` IS NULL OR JSON_LENGTH(`cover_image_urls`) = 0)',
  'SELECT 1'
);

PREPARE stmt FROM @backfill;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
