-- Per-traveler pricing on booking manifest entries (assisted booking approval).

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'booking_manifest_entries' AND column_name = 'price_cents') = 0,
  'ALTER TABLE `booking_manifest_entries` ADD COLUMN `price_cents` INT UNSIGNED NULL AFTER `sort_order`',
  'SELECT ''booking_manifest_entries.price_cents already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
