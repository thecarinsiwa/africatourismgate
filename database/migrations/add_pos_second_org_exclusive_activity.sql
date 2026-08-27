-- POS-3: 2e organisation + activité exclusive (catalogue multi-tenant).
-- Fresh installs: same rows also live in database/seeds/install.seed.sql.
-- Requires: add_catalog_organization_id.sql (activities.organization_id).

INSERT INTO `organizations` (
  `id`, `name`, `slug`, `description`, `contact_email`, `currency`, `status`,
  `created_by_user_id`, `updated_by_user_id`
)
SELECT
  '00000000-0000-4000-8000-000000000002',
  'Kinshasa Guichet Est',
  'kinshasa-guichet-est',
  'Organisation POS de test multi-tenant (produits exclusifs).',
  'guichet-est@africatourismgate.local',
  'USD',
  'active',
  '00000000-0000-4000-8000-000000000010',
  '00000000-0000-4000-8000-000000000010'
FROM DUAL
WHERE EXISTS (
  SELECT 1 FROM `users` WHERE `id` = '00000000-0000-4000-8000-000000000010'
)
AND NOT EXISTS (
  SELECT 1 FROM `organizations` WHERE `id` = '00000000-0000-4000-8000-000000000002'
);

INSERT INTO `organization_settings` (
  `id`, `organization_id`, `setting_group`, `setting_key`, `setting_value`,
  `created_by_user_id`
)
SELECT
  '00000000-0000-4000-8000-000000000021',
  '00000000-0000-4000-8000-000000000002',
  'branding',
  'platform',
  '{"displayName":"Kinshasa Guichet Est","primaryColor":"#0B4F6C","secondaryColor":"#01BAEF"}',
  '00000000-0000-4000-8000-000000000010'
FROM DUAL
WHERE EXISTS (
  SELECT 1 FROM `organizations` WHERE `id` = '00000000-0000-4000-8000-000000000002'
)
AND NOT EXISTS (
  SELECT 1 FROM `organization_settings` WHERE `id` = '00000000-0000-4000-8000-000000000021'
);

INSERT INTO `activities` (
  `id`, `provider_id`, `title`, `description`, `duration_minutes`, `difficulty_level`,
  `price_cents`, `currency`, `organization_id`, `created_by_user_id`
)
SELECT
  '00000000-0000-4000-8000-000000004050',
  '00000000-0000-4000-8000-000000004030',
  'Atelier exclusif Guichet Est',
  'Activité exclusive org Guichet Est — ne doit pas apparaître en caisse Africa Tourism Gate (POS-3).',
  90,
  'easy',
  7500,
  'USD',
  '00000000-0000-4000-8000-000000000002',
  '00000000-0000-4000-8000-000000000010'
FROM DUAL
WHERE EXISTS (
  SELECT 1 FROM `activity_providers` WHERE `id` = '00000000-0000-4000-8000-000000004030'
)
AND EXISTS (
  SELECT 1
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'activities'
    AND column_name = 'organization_id'
)
AND EXISTS (
  SELECT 1 FROM `organizations` WHERE `id` = '00000000-0000-4000-8000-000000000002'
)
AND NOT EXISTS (
  SELECT 1 FROM `activities` WHERE `id` = '00000000-0000-4000-8000-000000004050'
);

INSERT INTO `activity_schedules` (
  `id`, `activity_id`, `start_datetime`, `capacity`, `booked_count`, `created_by_user_id`
)
SELECT
  '00000000-0000-4000-8000-000000004051',
  '00000000-0000-4000-8000-000000004050',
  '2026-09-15 10:00:00',
  10,
  0,
  '00000000-0000-4000-8000-000000000010'
FROM DUAL
WHERE EXISTS (
  SELECT 1 FROM `activities` WHERE `id` = '00000000-0000-4000-8000-000000004050'
)
AND NOT EXISTS (
  SELECT 1 FROM `activity_schedules` WHERE `id` = '00000000-0000-4000-8000-000000004051'
);
