-- Tripadvisor Terra sync credentials (idempotent).
-- Admin › Contenu › Avis — locationId + apiKey + language.
-- Never expose via public organization-settings endpoints.
-- Skips when platform org is not present yet (CI schema sync before seed).
-- Fresh installs also get this via database/seeds/install.seed*.sql.
-- Runtime falls back to DEFAULT_TRIPADVISOR_SYNC when the row is missing.
-- uk_org_settings_key (organization_id, setting_key) also covers soft-deleted rows,
-- so the existence check intentionally ignores deleted_at.

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
  'site',
  'tripadvisor_sync',
  JSON_OBJECT(
    'locationId', '',
    'apiKey', '',
    'language', 'primary'
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
    AND setting_key = 'tripadvisor_sync'
);
