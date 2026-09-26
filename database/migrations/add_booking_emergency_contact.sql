-- Booking-level emergency contact (one per reservation).
-- Backfill from manifest entries runs in backfill_booking_emergency_contact_from_manifest.sql
-- (this file sorts before add_booking_manifest_entries.sql).

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'bookings' AND column_name = 'emergency_contact_name') = 0,
  'ALTER TABLE `bookings` ADD COLUMN `emergency_contact_name` VARCHAR(200) NULL AFTER `preferred_payment_method`',
  'SELECT ''bookings.emergency_contact_name already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'bookings' AND column_name = 'emergency_contact_phone') = 0,
  'ALTER TABLE `bookings` ADD COLUMN `emergency_contact_phone` VARCHAR(40) NULL AFTER `emergency_contact_name`',
  'SELECT ''bookings.emergency_contact_phone already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'bookings' AND column_name = 'emergency_contact_email') = 0,
  'ALTER TABLE `bookings` ADD COLUMN `emergency_contact_email` VARCHAR(255) NULL AFTER `emergency_contact_phone`',
  'SELECT ''bookings.emergency_contact_email already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'bookings' AND column_name = 'emergency_contact_country') = 0,
  'ALTER TABLE `bookings` ADD COLUMN `emergency_contact_country` VARCHAR(100) NULL AFTER `emergency_contact_email`',
  'SELECT ''bookings.emergency_contact_country already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'bookings' AND column_name = 'emergency_contact_address') = 0,
  'ALTER TABLE `bookings` ADD COLUMN `emergency_contact_address` VARCHAR(500) NULL AFTER `emergency_contact_country`',
  'SELECT ''bookings.emergency_contact_address already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
