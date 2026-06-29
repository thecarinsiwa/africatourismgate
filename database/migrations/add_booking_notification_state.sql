-- CE-12: assisted booking notifications (thread presence, payment reminder dedup)
ALTER TABLE `bookings`
  ADD COLUMN `customer_thread_last_seen_at` DATETIME DEFAULT NULL AFTER `promotion_id`,
  ADD COLUMN `customer_thread_presence_at` DATETIME DEFAULT NULL AFTER `customer_thread_last_seen_at`,
  ADD COLUMN `payment_reminder_sent_at` DATETIME DEFAULT NULL AFTER `customer_thread_presence_at`;
