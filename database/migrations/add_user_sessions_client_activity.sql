-- Session policy: one session per browser profile + idle lock tracking.

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_sessions' AND column_name = 'client_instance_id') = 0,
  'ALTER TABLE `user_sessions` ADD COLUMN `client_instance_id` CHAR(36) DEFAULT NULL AFTER `user_id`',
  'SELECT ''user_sessions.client_instance_id already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_sessions' AND column_name = 'last_activity_at') = 0,
  'ALTER TABLE `user_sessions` ADD COLUMN `last_activity_at` DATETIME DEFAULT NULL AFTER `expires_at`',
  'SELECT ''user_sessions.last_activity_at already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'user_sessions' AND index_name = 'idx_user_sessions_client_instance') = 0,
  'CREATE INDEX `idx_user_sessions_client_instance` ON `user_sessions` (`user_id`, `client_instance_id`, `deleted_at`)',
  'SELECT ''idx_user_sessions_client_instance already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
