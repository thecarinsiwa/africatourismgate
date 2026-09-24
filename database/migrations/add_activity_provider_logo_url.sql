SET @has_column := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'activity_providers'
    AND COLUMN_NAME = 'logo_url'
);

SET @ddl := IF(
  @has_column = 0,
  'ALTER TABLE `activity_providers` ADD COLUMN `logo_url` VARCHAR(512) NULL AFTER `name`',
  'SELECT 1'
);

PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
