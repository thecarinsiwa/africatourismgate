-- PR-08: disable cash on public web checkout by default (idempotent).
-- Reuses booking/payment_methods.cash as the web-only allow flag.
-- POS and admin cash recording are unaffected (skip web payment gate).
-- Admins can re-enable cash in Paramètres → Moyens de paiement (site public).
-- Fresh installs also get cash:false via database/seeds/install.seed.sql
-- and DEFAULT_WEB_PAYMENT_METHODS when the row is missing.

UPDATE organization_settings
SET setting_value = JSON_SET(setting_value, '$.cash', FALSE)
WHERE setting_group = 'booking'
  AND setting_key = 'payment_methods'
  AND deleted_at IS NULL
  AND (
    JSON_EXTRACT(setting_value, '$.cash') IS NULL
    OR JSON_EXTRACT(setting_value, '$.cash') = TRUE
    OR JSON_EXTRACT(setting_value, '$.cash') = 1
  );
