-- Org-scoped departments referential + seed from existing employee.department values
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `departments` (
  `id` CHAR(36) NOT NULL,
  `organization_id` CHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `created_by_user_id` CHAR(36) DEFAULT NULL,
  `updated_by_user_id` CHAR(36) DEFAULT NULL,
  `deleted_by_user_id` CHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_departments_org_name` (`organization_id`, `name`),
  KEY `idx_departments_org` (`organization_id`),
  KEY `idx_departments_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_departments_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_departments_created_by` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_departments_updated_by` FOREIGN KEY (`updated_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_departments_deleted_by` FOREIGN KEY (`deleted_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `departments` (`id`, `organization_id`, `name`)
SELECT
  UUID(),
  e.`organization_id`,
  TRIM(e.`department`)
FROM `employees` e
WHERE e.`deleted_at` IS NULL
  AND e.`organization_id` IS NOT NULL
  AND e.`department` IS NOT NULL
  AND TRIM(e.`department`) <> ''
  AND NOT EXISTS (
    SELECT 1
    FROM `departments` d
    WHERE d.`organization_id` = e.`organization_id`
      AND d.`name` = TRIM(e.`department`)
      AND d.`deleted_at` IS NULL
  )
GROUP BY e.`organization_id`, TRIM(e.`department`);
