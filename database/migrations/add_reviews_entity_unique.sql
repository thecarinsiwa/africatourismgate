-- Livrable #39: one review per entity (e.g. one review per booking)
ALTER TABLE `reviews`
  DROP INDEX `idx_reviews_entity`,
  ADD UNIQUE KEY `uq_reviews_entity` (`entity_type`, `entity_id`);
