-- Cover image for marketing promotions (defensive: column may already exist)

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'promotions' AND column_name = 'cover_image_url') = 0,
  'ALTER TABLE `promotions` ADD COLUMN `cover_image_url` VARCHAR(512) DEFAULT NULL AFTER `description`',
  'SELECT ''promotions.cover_image_url already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
