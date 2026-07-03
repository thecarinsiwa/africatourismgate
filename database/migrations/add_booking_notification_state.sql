-- CE-12: assisted booking notifications (thread presence, payment reminder dedup)
-- Defensive: columns may already exist in fresh schema import.

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'bookings' AND column_name = 'customer_thread_last_seen_at') = 0,
  'ALTER TABLE `bookings` ADD COLUMN `customer_thread_last_seen_at` DATETIME DEFAULT NULL AFTER `promotion_id`',
  'SELECT ''bookings.customer_thread_last_seen_at already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'bookings' AND column_name = 'customer_thread_presence_at') = 0,
  'ALTER TABLE `bookings` ADD COLUMN `customer_thread_presence_at` DATETIME DEFAULT NULL AFTER `customer_thread_last_seen_at`',
  'SELECT ''bookings.customer_thread_presence_at already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'bookings' AND column_name = 'payment_reminder_sent_at') = 0,
  'ALTER TABLE `bookings` ADD COLUMN `payment_reminder_sent_at` DATETIME DEFAULT NULL AFTER `customer_thread_presence_at`',
  'SELECT ''bookings.payment_reminder_sent_at already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
