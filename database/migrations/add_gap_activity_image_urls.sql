-- Multiple images for GAP activities (max 10 enforced in API).
-- Keeps image_url as the cover (first URL) for public API compatibility.

ALTER TABLE `gap_activities`
  ADD COLUMN `image_urls` JSON NULL AFTER `image_url`;

UPDATE `gap_activities`
SET `image_urls` = JSON_ARRAY(`image_url`)
WHERE `image_url` IS NOT NULL
  AND TRIM(`image_url`) <> ''
  AND (`image_urls` IS NULL OR JSON_LENGTH(`image_urls`) = 0);
