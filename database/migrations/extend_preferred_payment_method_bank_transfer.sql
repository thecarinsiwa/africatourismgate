-- Extend bookings.preferred_payment_method with bank_transfer (PR-06).

ALTER TABLE `bookings`
  MODIFY COLUMN `preferred_payment_method` ENUM('stripe', 'cash', 'bank_transfer') DEFAULT NULL;
