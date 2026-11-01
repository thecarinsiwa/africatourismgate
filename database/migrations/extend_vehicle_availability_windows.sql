-- Keep demo / seed vehicle windows bookable past mid-2026.
UPDATE `vehicle_availability`
SET `end_datetime` = '2027-12-31 18:00:00'
WHERE `deleted_at` IS NULL
  AND `status` = 'available'
  AND `end_datetime` < '2027-01-01 00:00:00';
