-- Team member public profile: unique slug per locale + contact / social links.
-- Idempotent: each column / index is added only when missing.

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'team_members' AND column_name = 'slug') = 0,
  'ALTER TABLE `team_members` ADD COLUMN `slug` VARCHAR(180) DEFAULT NULL AFTER `name`',
  'SELECT ''team_members.slug already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'team_members' AND column_name = 'email') = 0,
  'ALTER TABLE `team_members` ADD COLUMN `email` VARCHAR(255) DEFAULT NULL AFTER `photo_url`',
  'SELECT ''team_members.email already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'team_members' AND column_name = 'linkedin_url') = 0,
  'ALTER TABLE `team_members` ADD COLUMN `linkedin_url` VARCHAR(512) DEFAULT NULL AFTER `email`',
  'SELECT ''team_members.linkedin_url already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'team_members' AND column_name = 'x_url') = 0,
  'ALTER TABLE `team_members` ADD COLUMN `x_url` VARCHAR(512) DEFAULT NULL AFTER `linkedin_url`',
  'SELECT ''team_members.x_url already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'team_members' AND column_name = 'facebook_url') = 0,
  'ALTER TABLE `team_members` ADD COLUMN `facebook_url` VARCHAR(512) DEFAULT NULL AFTER `x_url`',
  'SELECT ''team_members.facebook_url already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'team_members' AND column_name = 'instagram_url') = 0,
  'ALTER TABLE `team_members` ADD COLUMN `instagram_url` VARCHAR(512) DEFAULT NULL AFTER `facebook_url`',
  'SELECT ''team_members.instagram_url already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Backfill slugs from names (lowercase ASCII, hyphen-separated).
UPDATE `team_members` SET `slug` = LOWER(TRIM(`name`)) WHERE `slug` IS NULL OR TRIM(`slug`) = '';
UPDATE `team_members` SET `slug` = REGEXP_REPLACE(`slug`, '[àáâäãåā]', 'a') WHERE `slug` REGEXP '[àáâäãåā]';
UPDATE `team_members` SET `slug` = REGEXP_REPLACE(`slug`, '[çć]', 'c') WHERE `slug` REGEXP '[çć]';
UPDATE `team_members` SET `slug` = REGEXP_REPLACE(`slug`, '[èéêëē]', 'e') WHERE `slug` REGEXP '[èéêëē]';
UPDATE `team_members` SET `slug` = REGEXP_REPLACE(`slug`, '[ìíîïī]', 'i') WHERE `slug` REGEXP '[ìíîïī]';
UPDATE `team_members` SET `slug` = REGEXP_REPLACE(`slug`, '[ñ]', 'n') WHERE `slug` REGEXP '[ñ]';
UPDATE `team_members` SET `slug` = REGEXP_REPLACE(`slug`, '[òóôöõøō]', 'o') WHERE `slug` REGEXP '[òóôöõøō]';
UPDATE `team_members` SET `slug` = REGEXP_REPLACE(`slug`, '[ùúûüū]', 'u') WHERE `slug` REGEXP '[ùúûüū]';
UPDATE `team_members` SET `slug` = REGEXP_REPLACE(`slug`, '[ýÿ]', 'y') WHERE `slug` REGEXP '[ýÿ]';
UPDATE `team_members` SET `slug` = REPLACE(REPLACE(`slug`, 'œ', 'oe'), 'æ', 'ae');
UPDATE `team_members` SET `slug` = REGEXP_REPLACE(`slug`, '[^a-z0-9]+', '-');
UPDATE `team_members` SET `slug` = TRIM(BOTH '-' FROM LEFT(TRIM(BOTH '-' FROM `slug`), 170));
UPDATE `team_members` SET `slug` = CONCAT('member-', LEFT(REPLACE(`id`, '-', ''), 8)) WHERE `slug` = '';

-- Disambiguate duplicates within a locale (oldest row keeps the plain slug).
UPDATE `team_members` AS t
JOIN (
  SELECT `id`
  FROM (
    SELECT
      `id`,
      ROW_NUMBER() OVER (PARTITION BY `locale`, `slug` ORDER BY `created_at`, `id`) AS rn
    FROM `team_members`
  ) AS ranked
  WHERE ranked.rn > 1
) AS dup ON dup.`id` = t.`id`
SET t.`slug` = CONCAT(t.`slug`, '-', LEFT(REPLACE(t.`id`, '-', ''), 8));

ALTER TABLE `team_members` MODIFY COLUMN `slug` VARCHAR(180) NOT NULL;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'team_members' AND index_name = 'uq_team_members_locale_slug') = 0,
  'ALTER TABLE `team_members` ADD UNIQUE KEY `uq_team_members_locale_slug` (`locale`, `slug`)',
  'SELECT ''uq_team_members_locale_slug already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
