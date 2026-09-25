-- Catalog product verticals for public menu (idempotent).
-- All verticals enabled by default (backward compatible).
-- Skips when platform org is not present yet (CI schema sync before seed).
-- Fresh installs also get this via database/seeds/install.seed.sql.
-- Runtime falls back to DEFAULT_CATALOG_PRODUCTS when the row is missing.

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
  'catalog',
  'products_enabled',
  JSON_OBJECT(
    'hotels', TRUE,
    'flights', TRUE,
    'cars', TRUE,
    'cruises', TRUE,
    'tours', TRUE,
    'packages', TRUE
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
    AND setting_key = 'products_enabled'
    AND deleted_at IS NULL
);
