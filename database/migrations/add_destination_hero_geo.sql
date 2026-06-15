ALTER TABLE `destinations`
  ADD COLUMN `image_url` VARCHAR(512) DEFAULT NULL AFTER `description`,
  ADD COLUMN `latitude` DECIMAL(10, 7) DEFAULT NULL AFTER `image_url`,
  ADD COLUMN `longitude` DECIMAL(10, 7) DEFAULT NULL AFTER `latitude`;
