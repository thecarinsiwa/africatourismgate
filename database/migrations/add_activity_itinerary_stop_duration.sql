ALTER TABLE `activity_itinerary_stops`
  ADD COLUMN `duration_minutes` INT DEFAULT NULL AFTER `description`;
