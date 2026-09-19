-- Extend bookings.preferred_payment_method with mobile_money (PR-13 Phase B).

ALTER TABLE `bookings`
  MODIFY COLUMN `preferred_payment_method` ENUM('stripe', 'cash', 'bank_transfer', 'mobile_money') DEFAULT NULL;
