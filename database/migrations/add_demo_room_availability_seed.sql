-- Demo room availability for admin H4 e2e (Standard Double, Aug 2026)
INSERT INTO `room_availability` (
  `id`, `room_id`, `date`, `available_units`, `price_cents`, `created_by_user_id`
) VALUES
(
  '00000000-0000-4000-8000-000000002012',
  '00000000-0000-4000-8000-000000002011',
  '2026-08-01',
  0,
  8500,
  '00000000-0000-4000-8000-000000000010'
),
(
  '00000000-0000-4000-8000-000000002013',
  '00000000-0000-4000-8000-000000002011',
  '2026-08-08',
  6,
  9200,
  '00000000-0000-4000-8000-000000000010'
)
ON DUPLICATE KEY UPDATE
  `available_units` = VALUES(`available_units`),
  `price_cents` = VALUES(`price_cents`);
