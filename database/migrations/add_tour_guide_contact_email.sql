-- Contact e-mail for external tour guides (assignment notifications)
ALTER TABLE `tour_guides`
  ADD COLUMN `contact_email` VARCHAR(255) DEFAULT NULL AFTER `photo_url`;

UPDATE `tour_guides`
SET `contact_email` = 'jean-pierre.mwamba@example.com'
WHERE `id` = '00000000-0000-4000-8000-000000000702'
  AND `type` = 'external'
  AND (`contact_email` IS NULL OR `contact_email` = '');
