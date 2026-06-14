ALTER TABLE `activities`
  ADD COLUMN `difficulty_level` ENUM('easy', 'moderate', 'hard', 'expert') DEFAULT NULL
  AFTER `duration_minutes`;
