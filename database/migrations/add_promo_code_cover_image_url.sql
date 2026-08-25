-- Cover image for promo codes (defensive: column may already exist)

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'promo_codes' AND column_name = 'cover_image_url') = 0,
  'ALTER TABLE `promo_codes` ADD COLUMN `cover_image_url` VARCHAR(512) DEFAULT NULL AFTER `code`',
  'SELECT ''promo_codes.cover_image_url already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
