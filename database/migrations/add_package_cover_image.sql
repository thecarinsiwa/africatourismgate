SET @has_column := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'packages'
    AND COLUMN_NAME = 'cover_image_url'
);

SET @ddl := IF(
  @has_column = 0,
  'ALTER TABLE `packages` ADD COLUMN `cover_image_url` VARCHAR(512) NULL AFTER `description`',
  'SELECT 1'
);

PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
