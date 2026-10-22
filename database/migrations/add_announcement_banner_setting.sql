-- Public site announcement banner (idempotent).
-- Disabled by default: no message is shown until an admin enables it
-- (Admin › Contenu › Site › Bandeau d'annonce).
-- Skips when platform org is not present yet (CI schema sync before seed).
-- Fresh installs also get this via database/seeds/install.seed*.sql.
-- Runtime falls back to DEFAULT_ANNOUNCEMENT_BANNER when the row is missing.
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
  'announcement_banner',
  JSON_OBJECT(
    'enabled', FALSE,
    'color', 'blue',
    'intensity', 'low',
    'messages', JSON_OBJECT()
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
    AND setting_key = 'announcement_banner'
);
