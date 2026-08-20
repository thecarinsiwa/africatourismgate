-- Multiple cover images for GAP pages (max 10 enforced in API).
-- Keeps cover_image_url as the cover (first URL) for public API compatibility.

ALTER TABLE `gap_pages`
  ADD COLUMN `cover_image_urls` JSON NULL AFTER `cover_image_url`;

UPDATE `gap_pages`
SET `cover_image_urls` = JSON_ARRAY(`cover_image_url`)
WHERE `cover_image_url` IS NOT NULL
  AND TRIM(`cover_image_url`) <> ''
  AND (`cover_image_urls` IS NULL OR JSON_LENGTH(`cover_image_urls`) = 0);
