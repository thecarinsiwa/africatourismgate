-- Promotion discount fields + booking link (Livrable #32)
ALTER TABLE `promotions`
  ADD COLUMN `discount_type` ENUM('percent','fixed_amount') DEFAULT NULL AFTER `description`,
  ADD COLUMN `discount_value` DECIMAL(12,2) DEFAULT NULL AFTER `discount_type`,
  ADD COLUMN `valid_from` DATE DEFAULT NULL AFTER `discount_value`,
  ADD COLUMN `valid_until` DATE DEFAULT NULL AFTER `valid_from`,
  ADD COLUMN `max_redemptions` INT UNSIGNED DEFAULT NULL AFTER `valid_until`,
  ADD COLUMN `redemption_count` INT UNSIGNED NOT NULL DEFAULT 0 AFTER `max_redemptions`;

ALTER TABLE `bookings`
  ADD COLUMN `promotion_id` CHAR(36) DEFAULT NULL AFTER `promo_code_id`,
  ADD KEY `idx_bookings_promotion` (`promotion_id`),
  ADD CONSTRAINT `fk_bookings_promotion` FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`id`) ON DELETE SET NULL;
