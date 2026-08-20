-- Partner / external links for GAP site settings (max 10 enforced in API).
-- Backfills from legacy unesco_label + unesco_url.

SET @has_column := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'gap_site_settings'
    AND COLUMN_NAME = 'links'
);

SET @ddl := IF(
  @has_column = 0,
  'ALTER TABLE `gap_site_settings` ADD COLUMN `links` JSON NULL AFTER `unesco_url`',
  'SELECT 1'
);

PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE `gap_site_settings`
SET `links` = JSON_ARRAY(
  JSON_OBJECT(
    'label', `unesco_label`,
    'url', `unesco_url`
  )
)
WHERE `unesco_label` IS NOT NULL
  AND TRIM(`unesco_label`) <> ''
  AND `unesco_url` IS NOT NULL
  AND TRIM(`unesco_url`) <> ''
  AND (`links` IS NULL OR JSON_LENGTH(`links`) = 0);

UPDATE `gap_site_settings`
SET `links` = JSON_ARRAY(
  JSON_OBJECT(
    'label', `unesco_label`,
    'url', ''
  )
)
WHERE `unesco_label` IS NOT NULL
  AND TRIM(`unesco_label`) <> ''
  AND (`unesco_url` IS NULL OR TRIM(`unesco_url`) = '')
  AND (`links` IS NULL OR JSON_LENGTH(`links`) = 0);
