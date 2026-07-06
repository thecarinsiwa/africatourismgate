ALTER TABLE `packages`
  ADD COLUMN `is_featured` TINYINT(1) NOT NULL DEFAULT 0 AFTER `active`;

CREATE INDEX `idx_packages_featured_active` ON `packages` (`is_featured`, `active`);
