-- Multiple images for GAP activities (max 10 enforced in API).
-- Filename sorts after add_gap_content.sql so gap_activities exists first.
-- Keeps image_url as the cover (first URL) for public API compatibility.

SET @has_column := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'gap_activities'
    AND COLUMN_NAME = 'image_urls'
);

SET @ddl := IF(
  @has_column = 0,
  'ALTER TABLE `gap_activities` ADD COLUMN `image_urls` JSON NULL AFTER `image_url`',
  'SELECT 1'
);

PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE `gap_activities`
SET `image_urls` = JSON_ARRAY(`image_url`)
WHERE `image_url` IS NOT NULL
  AND TRIM(`image_url`) <> ''
  AND (`image_urls` IS NULL OR JSON_LENGTH(`image_urls`) = 0);
