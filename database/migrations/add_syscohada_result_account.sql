-- SYSCO-008 — Compte de résultat net (classe 1) pour OD de clôture MVP
SET NAMES utf8mb4;

INSERT IGNORE INTO `chart_of_accounts` (
  `id`, `organization_id`, `code`, `label`, `class_number`, `account_type`,
  `parent_id`, `is_postable`, `is_active`, `syscohada_ref`
)
SELECT
  '00000000-0000-4000-8000-000000002008',
  o.`id`,
  '13',
  'Résultat net de l''exercice',
  1,
  'equity',
  NULL,
  1,
  1,
  '13'
FROM `organizations` o
WHERE o.`id` = '00000000-0000-4000-8000-000000000001'
  AND o.`deleted_at` IS NULL;
