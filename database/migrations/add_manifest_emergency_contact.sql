-- Emergency contact fields on booking manifest traveler entries (PR-04).

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'booking_manifest_entries' AND column_name = 'emergency_contact_name') = 0,
  'ALTER TABLE `booking_manifest_entries` ADD COLUMN `emergency_contact_name` VARCHAR(200) NULL AFTER `id_number`',
  'SELECT ''booking_manifest_entries.emergency_contact_name already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'booking_manifest_entries' AND column_name = 'emergency_contact_phone') = 0,
  'ALTER TABLE `booking_manifest_entries` ADD COLUMN `emergency_contact_phone` VARCHAR(40) NULL AFTER `emergency_contact_name`',
  'SELECT ''booking_manifest_entries.emergency_contact_phone already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'booking_manifest_entries' AND column_name = 'emergency_contact_email') = 0,
  'ALTER TABLE `booking_manifest_entries` ADD COLUMN `emergency_contact_email` VARCHAR(255) NULL AFTER `emergency_contact_phone`',
  'SELECT ''booking_manifest_entries.emergency_contact_email already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'booking_manifest_entries' AND column_name = 'emergency_contact_country') = 0,
  'ALTER TABLE `booking_manifest_entries` ADD COLUMN `emergency_contact_country` VARCHAR(100) NULL AFTER `emergency_contact_email`',
  'SELECT ''booking_manifest_entries.emergency_contact_country already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'booking_manifest_entries' AND column_name = 'emergency_contact_address') = 0,
  'ALTER TABLE `booking_manifest_entries` ADD COLUMN `emergency_contact_address` VARCHAR(500) NULL AFTER `emergency_contact_country`',
  'SELECT ''booking_manifest_entries.emergency_contact_address already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
