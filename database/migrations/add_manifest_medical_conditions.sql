-- Structured light medical fields on booking manifest traveler entries (PR-05).
-- Keeps legacy `conditions` column for read compatibility.

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'booking_manifest_entries' AND column_name = 'allergies') = 0,
  'ALTER TABLE `booking_manifest_entries` ADD COLUMN `allergies` TEXT NULL AFTER `conditions`',
  'SELECT ''booking_manifest_entries.allergies already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'booking_manifest_entries' AND column_name = 'serious_medical_conditions') = 0,
  'ALTER TABLE `booking_manifest_entries` ADD COLUMN `serious_medical_conditions` TEXT NULL AFTER `allergies`',
  'SELECT ''booking_manifest_entries.serious_medical_conditions already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'booking_manifest_entries' AND column_name = 'current_medications') = 0,
  'ALTER TABLE `booking_manifest_entries` ADD COLUMN `current_medications` TEXT NULL AFTER `serious_medical_conditions`',
  'SELECT ''booking_manifest_entries.current_medications already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'booking_manifest_entries' AND column_name = 'dietary_notes') = 0,
  'ALTER TABLE `booking_manifest_entries` ADD COLUMN `dietary_notes` TEXT NULL AFTER `current_medications`',
  'SELECT ''booking_manifest_entries.dietary_notes already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Retrocompat: copy free-text `conditions` into `other` when `other` is empty.
UPDATE `booking_manifest_entries`
SET `other` = `conditions`
WHERE `conditions` IS NOT NULL
  AND TRIM(`conditions`) <> ''
  AND (`other` IS NULL OR TRIM(`other`) = '');
