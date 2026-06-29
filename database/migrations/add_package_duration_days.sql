ALTER TABLE `packages`
  ADD COLUMN `duration_days` SMALLINT UNSIGNED NOT NULL DEFAULT 3
  AFTER `discount_percent`;
