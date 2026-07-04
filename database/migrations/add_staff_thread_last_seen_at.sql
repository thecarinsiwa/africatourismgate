-- Staff thread read state for unread customer message badges in admin.

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'bookings' AND column_name = 'staff_thread_last_seen_at') = 0,
  'ALTER TABLE `bookings` ADD COLUMN `staff_thread_last_seen_at` DATETIME DEFAULT NULL AFTER `customer_thread_presence_at`',
  'SELECT ''bookings.staff_thread_last_seen_at already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
