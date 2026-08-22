-- Featured package flag (defensive: column/index may already exist in fresh schema import)

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'packages' AND column_name = 'is_featured') = 0,
  'ALTER TABLE `packages` ADD COLUMN `is_featured` TINYINT(1) NOT NULL DEFAULT 0 AFTER `active`',
  'SELECT ''packages.is_featured already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'packages' AND index_name = 'idx_packages_featured_active') = 0,
  'ALTER TABLE `packages` ADD KEY `idx_packages_featured_active` (`is_featured`, `active`)',
  'SELECT ''idx_packages_featured_active already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
