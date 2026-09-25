-- Backfill booking-level emergency contact from the first manifest entry that has a contact
-- (prefer sort_order = 0). Runs after add_booking_manifest_entries + add_manifest_emergency_contact.

UPDATE `bookings` b
INNER JOIN (
  SELECT
    m.`booking_id`,
    m.`emergency_contact_name`,
    m.`emergency_contact_phone`,
    m.`emergency_contact_email`,
    m.`emergency_contact_country`,
    m.`emergency_contact_address`
  FROM `booking_manifest_entries` m
  INNER JOIN (
    SELECT
      `booking_id`,
      MIN(
        CASE
          WHEN TRIM(COALESCE(`emergency_contact_name`, '')) <> '' AND `sort_order` = 0 THEN 0
          WHEN TRIM(COALESCE(`emergency_contact_name`, '')) <> '' THEN 1 + `sort_order`
          ELSE NULL
        END
      ) AS pick_rank
    FROM `booking_manifest_entries`
    WHERE `deleted_at` IS NULL
    GROUP BY `booking_id`
  ) ranked
    ON ranked.`booking_id` = m.`booking_id`
   AND (
     CASE
       WHEN TRIM(COALESCE(m.`emergency_contact_name`, '')) <> '' AND m.`sort_order` = 0 THEN 0
       WHEN TRIM(COALESCE(m.`emergency_contact_name`, '')) <> '' THEN 1 + m.`sort_order`
       ELSE NULL
     END
   ) = ranked.`pick_rank`
  WHERE m.`deleted_at` IS NULL
) src ON src.`booking_id` = b.`id`
SET
  b.`emergency_contact_name` = COALESCE(b.`emergency_contact_name`, src.`emergency_contact_name`),
  b.`emergency_contact_phone` = COALESCE(b.`emergency_contact_phone`, src.`emergency_contact_phone`),
  b.`emergency_contact_email` = COALESCE(b.`emergency_contact_email`, src.`emergency_contact_email`),
  b.`emergency_contact_country` = COALESCE(b.`emergency_contact_country`, src.`emergency_contact_country`),
  b.`emergency_contact_address` = COALESCE(b.`emergency_contact_address`, src.`emergency_contact_address`)
WHERE b.`deleted_at` IS NULL
  AND b.`emergency_contact_name` IS NULL
  AND TRIM(COALESCE(src.`emergency_contact_name`, '')) <> '';
