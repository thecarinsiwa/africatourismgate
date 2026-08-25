-- Link blog post translations (one logical article per translation_key × locale).
-- Runs after add_blog_posts2_i18n.sql (numeric suffix avoids localeCompare ordering).

ALTER TABLE `blog_posts`
  ADD COLUMN `translation_key` VARCHAR(180) NULL AFTER `slug`;

UPDATE `blog_posts` SET `translation_key` = 'kenya-masai-mara' WHERE `id` IN (
  '00000000-0000-4000-8000-00000000b001',
  '00000000-0000-4000-8000-00000000b011',
  '00000000-0000-4000-8000-00000000b021'
);

UPDATE `blog_posts` SET `translation_key` = 'zanzibar-stone-town' WHERE `id` IN (
  '00000000-0000-4000-8000-00000000b002',
  '00000000-0000-4000-8000-00000000b012',
  '00000000-0000-4000-8000-00000000b022'
);

UPDATE `blog_posts` SET `translation_key` = 'rdc-kinshasa' WHERE `id` IN (
  '00000000-0000-4000-8000-00000000b003',
  '00000000-0000-4000-8000-00000000b013',
  '00000000-0000-4000-8000-00000000b023'
);

UPDATE `blog_posts` SET `translation_key` = `slug` WHERE `translation_key` IS NULL OR `translation_key` = '';

ALTER TABLE `blog_posts`
  MODIFY COLUMN `translation_key` VARCHAR(180) NOT NULL;

ALTER TABLE `blog_posts`
  ADD UNIQUE KEY `uk_blog_posts_translation_locale` (`translation_key`, `locale`);
