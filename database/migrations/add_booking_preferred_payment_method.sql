-- Preferred payment method chosen at checkout (stripe | cash).
-- NULL = legacy bookings created before this column existed.

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'bookings' AND column_name = 'preferred_payment_method') = 0,
  'ALTER TABLE `bookings` ADD COLUMN `preferred_payment_method` ENUM(''stripe'',''cash'') DEFAULT NULL AFTER `payment_reminder_sent_at`',
  'SELECT ''bookings.preferred_payment_method already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
