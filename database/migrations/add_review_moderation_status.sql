-- Review moderation status for admin workflow (defensive: column may already exist in fresh schema import)

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'reviews' AND column_name = 'status') = 0,
  'ALTER TABLE `reviews` ADD COLUMN `status` ENUM(''pending'',''approved'',''hidden'') NOT NULL DEFAULT ''approved'' AFTER `body`',
  'SELECT ''reviews.status already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE `reviews` SET `status` = 'approved' WHERE `status` IS NULL;
