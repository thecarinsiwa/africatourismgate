-- PR-07: default booking deposits setting for platform org (idempotent).
-- Deposits off until admin enables them in Paramètres.
-- Skips when platform org is not present yet (CI schema sync before seed).
-- Fresh installs also get this via database/seeds/install.seed.sql.
-- Runtime falls back to DEFAULT_BOOKING_DEPOSITS when the row is missing.

INSERT INTO organization_settings (
  id,
  organization_id,
  setting_group,
  setting_key,
  setting_value,
  created_by_user_id
)
SELECT
  UUID(),
  '00000000-0000-4000-8000-000000000001',
  'booking',
  'deposits',
  JSON_OBJECT(
    'enabled', FALSE
  ),
  '00000000-0000-4000-8000-000000000010'
WHERE EXISTS (
  SELECT 1
  FROM organizations
  WHERE id = '00000000-0000-4000-8000-000000000001'
    AND deleted_at IS NULL
)
AND NOT EXISTS (
  SELECT 1
  FROM organization_settings
  WHERE organization_id = '00000000-0000-4000-8000-000000000001'
    AND setting_key = 'deposits'
    AND deleted_at IS NULL
);
