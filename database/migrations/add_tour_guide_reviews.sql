-- CE-13: guide reviews (entity_type tour_guide, entity_id = booking_guide_assignments.id)
ALTER TABLE `reviews`
  MODIFY COLUMN `entity_type` ENUM(
    'property',
    'flight',
    'vehicle',
    'cruise',
    'activity',
    'booking',
    'tour_guide'
  ) NOT NULL;
