-- Activity description assets (images/docs as URL links) + strict description length cap.

CREATE TABLE IF NOT EXISTS `activity_description_assets` (
  `id` CHAR(36) NOT NULL,
  `activity_id` CHAR(36) NOT NULL,
  `asset_type` ENUM('image', 'pdf', 'word') NOT NULL,
  `url` VARCHAR(1024) NOT NULL,
  `name` VARCHAR(255) DEFAULT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_by_user_id` CHAR(36) DEFAULT NULL,
  `updated_by_user_id` CHAR(36) DEFAULT NULL,
  `deleted_by_user_id` CHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_act_desc_assets_activity` (`activity_id`),
  KEY `idx_act_desc_assets_type_sort` (`asset_type`, `sort_order`),
  KEY `idx_act_desc_assets_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_act_desc_assets_activity`
    FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_act_desc_assets_created_by`
    FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_act_desc_assets_updated_by`
    FOREIGN KEY (`updated_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_act_desc_assets_deleted_by`
    FOREIGN KEY (`deleted_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Normalize existing values before tightening schema.
UPDATE `activities`
SET `description` = LEFT(`description`, 5000)
WHERE `description` IS NOT NULL
  AND CHAR_LENGTH(`description`) > 5000;

-- Enforce strict 5000 characters at DB level.
ALTER TABLE `activities`
  MODIFY COLUMN `description` VARCHAR(5000) NULL;
