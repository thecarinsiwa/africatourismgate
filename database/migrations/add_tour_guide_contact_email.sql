-- Contact e-mail for external tour guides (defensive: column may already exist in fresh schema import)

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'tour_guides' AND column_name = 'contact_email') = 0,
  'ALTER TABLE `tour_guides` ADD COLUMN `contact_email` VARCHAR(255) DEFAULT NULL AFTER `photo_url`',
  'SELECT ''tour_guides.contact_email already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE `tour_guides`
SET `contact_email` = 'jean-pierre.mwamba@example.com'
WHERE `id` = '00000000-0000-4000-8000-000000000702'
  AND `type` = 'external'
  AND (`contact_email` IS NULL OR `contact_email` = '');
