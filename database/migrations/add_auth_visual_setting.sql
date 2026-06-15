-- Seed default auth visual icons for the platform organization (idempotent).
INSERT INTO `organization_settings` (
  `id`,
  `organization_id`,
  `setting_group`,
  `setting_key`,
  `setting_value`,
  `created_by_user_id`
)
SELECT
  '00000000-0000-4000-8000-000000000017',
  '00000000-0000-4000-8000-000000000001',
  'branding',
  'auth_visual',
  '{"icons":[{"preset":"pin","opacity":25,"size":"lg","position":"bottom-right","enabled":true},{"preset":"pin","opacity":60,"size":"sm","position":"top-right","enabled":true}]}',
  '00000000-0000-4000-8000-000000000010'
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1
  FROM `organization_settings`
  WHERE `organization_id` = '00000000-0000-4000-8000-000000000001'
    AND `setting_group` = 'branding'
    AND `setting_key` = 'auth_visual'
    AND `deleted_at` IS NULL
);
