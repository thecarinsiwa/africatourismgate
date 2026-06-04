-- Review moderation status for admin workflow
ALTER TABLE `reviews`
  ADD COLUMN `status` ENUM('pending','approved','hidden') NOT NULL DEFAULT 'approved'
  AFTER `body`;

UPDATE `reviews` SET `status` = 'approved';
