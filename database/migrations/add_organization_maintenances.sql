-- Fenêtres de maintenance du site public (multiples par organisation).
-- Seed idempotent depuis le setting legacy organization_settings (site / maintenance).

CREATE TABLE IF NOT EXISTS `organization_maintenances` (
  `id` CHAR(36) NOT NULL,
  `organization_id` CHAR(36) NOT NULL,
  `title` VARCHAR(200) DEFAULT NULL,
  `message` TEXT DEFAULT NULL,
  `enabled` TINYINT(1) NOT NULL DEFAULT 0,
  `starts_at` DATETIME NOT NULL,
  `ends_at` DATETIME DEFAULT NULL,
  `created_by_user_id` CHAR(36) DEFAULT NULL,
  `updated_by_user_id` CHAR(36) DEFAULT NULL,
  `deleted_by_user_id` CHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_org_maintenances_org` (`organization_id`),
  KEY `idx_org_maintenances_active_window` (`organization_id`, `enabled`, `starts_at`, `ends_at`),
  KEY `idx_org_maintenances_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_org_maintenances_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_org_maintenances_created_by` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_org_maintenances_updated_by` FOREIGN KEY (`updated_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_org_maintenances_deleted_by` FOREIGN KEY (`deleted_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copie du setting EAV legacy → première ligne par organisation (si aucune maintenance encore).
INSERT INTO `organization_maintenances` (
  `id`,
  `organization_id`,
  `title`,
  `message`,
  `enabled`,
  `starts_at`,
  `ends_at`,
  `created_by_user_id`,
  `updated_by_user_id`
)
SELECT
  UUID(),
  os.`organization_id`,
  NULLIF(TRIM(BOTH '"' FROM JSON_UNQUOTE(JSON_EXTRACT(os.`setting_value`, '$.title'))), ''),
  NULLIF(TRIM(BOTH '"' FROM JSON_UNQUOTE(JSON_EXTRACT(os.`setting_value`, '$.message'))), ''),
  IF(
    JSON_EXTRACT(os.`setting_value`, '$.enabled') = TRUE
    OR JSON_EXTRACT(os.`setting_value`, '$.enabled') = 1
    OR JSON_UNQUOTE(JSON_EXTRACT(os.`setting_value`, '$.enabled')) IN ('true', '1'),
    1,
    0
  ),
  UTC_TIMESTAMP(),
  CASE
    WHEN JSON_EXTRACT(os.`setting_value`, '$.endsAt') IS NULL THEN NULL
    WHEN JSON_TYPE(JSON_EXTRACT(os.`setting_value`, '$.endsAt')) = 'NULL' THEN NULL
    WHEN TRIM(BOTH '"' FROM JSON_UNQUOTE(JSON_EXTRACT(os.`setting_value`, '$.endsAt'))) IN ('', 'null') THEN NULL
    ELSE STR_TO_DATE(
      LEFT(REPLACE(TRIM(BOTH '"' FROM JSON_UNQUOTE(JSON_EXTRACT(os.`setting_value`, '$.endsAt'))), 'T', ' '), 19),
      '%Y-%m-%d %H:%i:%s'
    )
  END,
  os.`created_by_user_id`,
  os.`updated_by_user_id`
FROM `organization_settings` os
WHERE os.`setting_group` = 'site'
  AND os.`setting_key` = 'maintenance'
  AND os.`deleted_at` IS NULL
  AND EXISTS (
    SELECT 1
    FROM `organizations` o
    WHERE o.`id` = os.`organization_id`
      AND o.`deleted_at` IS NULL
  )
  AND NOT EXISTS (
    SELECT 1
    FROM `organization_maintenances` om
    WHERE om.`organization_id` = os.`organization_id`
      AND om.`deleted_at` IS NULL
  );

-- Soft-delete du setting legacy une fois qu’une ligne maintenance existe pour l’org.
UPDATE `organization_settings` os
SET
  os.`deleted_at` = UTC_TIMESTAMP(),
  os.`updated_at` = UTC_TIMESTAMP()
WHERE os.`setting_group` = 'site'
  AND os.`setting_key` = 'maintenance'
  AND os.`deleted_at` IS NULL
  AND EXISTS (
    SELECT 1
    FROM `organization_maintenances` om
    WHERE om.`organization_id` = os.`organization_id`
      AND om.`deleted_at` IS NULL
  );
