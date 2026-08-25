-- Guide time slots: datetime ranges on assignments and availability + assignment history.
-- Run on existing databases after add_guide_availability.sql.

-- ---------------------------------------------------------------------------
-- booking_guide_assignments — add schedule columns
-- ---------------------------------------------------------------------------

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns
   WHERE table_schema = DATABASE()
     AND table_name = 'booking_guide_assignments'
     AND column_name = 'start_datetime') = 0,
  'ALTER TABLE `booking_guide_assignments`
     ADD COLUMN `start_datetime` DATETIME NULL AFTER `role`,
     ADD COLUMN `end_datetime` DATETIME NULL AFTER `start_datetime`,
     ADD COLUMN `notes` VARCHAR(500) NULL AFTER `end_datetime`',
  'SELECT ''booking_guide_assignments.start_datetime already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE `booking_guide_assignments` AS bga
LEFT JOIN (
  SELECT
    bi.booking_id,
    MIN(bi.start_date) AS visit_start,
    MAX(COALESCE(bi.end_date, bi.start_date)) AS visit_end
  FROM `booking_items` AS bi
  WHERE bi.deleted_at IS NULL
    AND bi.start_date IS NOT NULL
  GROUP BY bi.booking_id
) AS visit ON visit.booking_id = bga.booking_id
SET
  bga.start_datetime = COALESCE(
    TIMESTAMP(visit.visit_start, '00:00:00'),
    TIMESTAMP(DATE(bga.assigned_at), '00:00:00')
  ),
  bga.end_datetime = COALESCE(
    TIMESTAMP(visit.visit_end, '23:59:59'),
    TIMESTAMP(DATE(bga.assigned_at), '23:59:59')
  )
WHERE bga.start_datetime IS NULL OR bga.end_datetime IS NULL;

SET @sql = IF(
  (SELECT IS_NULLABLE FROM information_schema.columns
   WHERE table_schema = DATABASE()
     AND table_name = 'booking_guide_assignments'
     AND column_name = 'start_datetime') = 'YES',
  'ALTER TABLE `booking_guide_assignments`
     MODIFY COLUMN `start_datetime` DATETIME NOT NULL,
     MODIFY COLUMN `end_datetime` DATETIME NOT NULL',
  'SELECT ''booking_guide_assignments schedule columns already NOT NULL'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics
   WHERE table_schema = DATABASE()
     AND table_name = 'booking_guide_assignments'
     AND index_name = 'uk_booking_guide') > 0,
  'ALTER TABLE `booking_guide_assignments` DROP INDEX `uk_booking_guide`',
  'SELECT ''uk_booking_guide already dropped'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics
   WHERE table_schema = DATABASE()
     AND table_name = 'booking_guide_assignments'
     AND index_name = 'idx_bga_guide_schedule') = 0,
  'ALTER TABLE `booking_guide_assignments`
     ADD KEY `idx_bga_guide_schedule` (`guide_id`, `start_datetime`, `end_datetime`)',
  'SELECT ''idx_bga_guide_schedule already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ---------------------------------------------------------------------------
-- guide_availability — migrate day-level rows to datetime ranges
-- ---------------------------------------------------------------------------

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.tables
   WHERE table_schema = DATABASE()
     AND table_name = 'guide_availability') = 0,
  'CREATE TABLE IF NOT EXISTS `guide_availability` (
    `id` CHAR(36) NOT NULL,
    `guide_id` CHAR(36) NOT NULL,
    `start_datetime` DATETIME NOT NULL,
    `end_datetime` DATETIME NOT NULL,
    `status` ENUM(''available'', ''unavailable'') NOT NULL DEFAULT ''unavailable'',
    `created_by_user_id` CHAR(36) DEFAULT NULL,
    `updated_by_user_id` CHAR(36) DEFAULT NULL,
    `deleted_by_user_id` CHAR(36) DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` DATETIME DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_guide_availability_guide_schedule` (`guide_id`, `start_datetime`, `end_datetime`),
    KEY `idx_guide_availability_deleted_at` (`deleted_at`),
    CONSTRAINT `fk_guide_availability_guide` FOREIGN KEY (`guide_id`) REFERENCES `tour_guides` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_guide_availability_created_by` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_guide_availability_updated_by` FOREIGN KEY (`updated_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_guide_availability_deleted_by` FOREIGN KEY (`deleted_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
  'SELECT ''guide_availability table already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns
   WHERE table_schema = DATABASE()
     AND table_name = 'guide_availability'
     AND column_name = 'date') > 0
  AND (SELECT COUNT(*) FROM information_schema.columns
       WHERE table_schema = DATABASE()
         AND table_name = 'guide_availability'
         AND column_name = 'start_datetime') = 0,
  'ALTER TABLE `guide_availability`
     ADD COLUMN `start_datetime` DATETIME NULL AFTER `guide_id`,
     ADD COLUMN `end_datetime` DATETIME NULL AFTER `start_datetime`',
  'SELECT ''guide_availability.date migration columns already handled'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns
   WHERE table_schema = DATABASE()
     AND table_name = 'guide_availability'
     AND column_name = 'date') > 0,
  'UPDATE `guide_availability`
     SET
       `start_datetime` = TIMESTAMP(`date`, ''00:00:00''),
       `end_datetime` = TIMESTAMP(`date`, ''23:59:59'')
     WHERE `date` IS NOT NULL
       AND (`start_datetime` IS NULL OR `end_datetime` IS NULL)',
  'SELECT ''guide_availability.date backfill skipped'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics
   WHERE table_schema = DATABASE()
     AND table_name = 'guide_availability'
     AND index_name = 'idx_guide_availability_guide_schedule') = 0,
  'ALTER TABLE `guide_availability`
     ADD KEY `idx_guide_availability_guide_schedule` (`guide_id`, `start_datetime`, `end_datetime`)',
  'SELECT ''idx_guide_availability_guide_schedule already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns
   WHERE table_schema = DATABASE()
     AND table_name = 'guide_availability'
     AND column_name = 'date') > 0,
  'ALTER TABLE `guide_availability`
     DROP INDEX `uk_guide_availability_guide_date`,
     DROP COLUMN `date`,
     MODIFY COLUMN `start_datetime` DATETIME NOT NULL,
     MODIFY COLUMN `end_datetime` DATETIME NOT NULL',
  'SELECT ''guide_availability.date already dropped'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- idx_guide_availability_guide_schedule added above before dropping legacy unique key (FK on guide_id).

-- ---------------------------------------------------------------------------
-- booking_guide_assignment_history — append-only audit trail
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `booking_guide_assignment_history` (
  `id` CHAR(36) NOT NULL,
  `assignment_id` CHAR(36) NOT NULL,
  `booking_id` CHAR(36) NOT NULL,
  `guide_id` CHAR(36) NOT NULL,
  `action` ENUM('created', 'updated', 'deleted') NOT NULL,
  `snapshot` JSON NOT NULL,
  `actor_user_id` CHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_bga_history_assignment` (`assignment_id`),
  KEY `idx_bga_history_booking` (`booking_id`),
  KEY `idx_bga_history_guide` (`guide_id`),
  KEY `idx_bga_history_created` (`created_at`),
  CONSTRAINT `fk_bga_history_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bga_history_guide` FOREIGN KEY (`guide_id`) REFERENCES `tour_guides` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bga_history_actor` FOREIGN KEY (`actor_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
