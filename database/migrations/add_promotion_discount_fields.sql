-- Promotion discount fields + booking link (Livrable #32)
-- Written defensively so db:sync can run on fresh and partially updated databases.

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'promotions' AND column_name = 'discount_type') = 0,
  'ALTER TABLE `promotions` ADD COLUMN `discount_type` ENUM(''percent'',''fixed_amount'') DEFAULT NULL AFTER `description`',
  'SELECT ''promotions.discount_type already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'promotions' AND column_name = 'discount_value') = 0,
  'ALTER TABLE `promotions` ADD COLUMN `discount_value` DECIMAL(12,2) DEFAULT NULL AFTER `discount_type`',
  'SELECT ''promotions.discount_value already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'promotions' AND column_name = 'valid_from') = 0,
  'ALTER TABLE `promotions` ADD COLUMN `valid_from` DATE DEFAULT NULL AFTER `discount_value`',
  'SELECT ''promotions.valid_from already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'promotions' AND column_name = 'valid_until') = 0,
  'ALTER TABLE `promotions` ADD COLUMN `valid_until` DATE DEFAULT NULL AFTER `valid_from`',
  'SELECT ''promotions.valid_until already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'promotions' AND column_name = 'max_redemptions') = 0,
  'ALTER TABLE `promotions` ADD COLUMN `max_redemptions` INT UNSIGNED DEFAULT NULL AFTER `valid_until`',
  'SELECT ''promotions.max_redemptions already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'promotions' AND column_name = 'redemption_count') = 0,
  'ALTER TABLE `promotions` ADD COLUMN `redemption_count` INT UNSIGNED NOT NULL DEFAULT 0 AFTER `max_redemptions`',
  'SELECT ''promotions.redemption_count already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'bookings' AND column_name = 'promotion_id') = 0,
  'ALTER TABLE `bookings` ADD COLUMN `promotion_id` CHAR(36) DEFAULT NULL AFTER `promo_code_id`',
  'SELECT ''bookings.promotion_id already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'bookings' AND index_name = 'idx_bookings_promotion') = 0,
  'ALTER TABLE `bookings` ADD KEY `idx_bookings_promotion` (`promotion_id`)',
  'SELECT ''idx_bookings_promotion already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.referential_constraints WHERE constraint_schema = DATABASE() AND table_name = 'bookings' AND constraint_name = 'fk_bookings_promotion') = 0,
  'ALTER TABLE `bookings` ADD CONSTRAINT `fk_bookings_promotion` FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`id`) ON DELETE SET NULL',
  'SELECT ''fk_bookings_promotion already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
