-- SYSCO-009 — Permissions RBAC `accounting.*` (complète treasury.accounting_link.read)
SET NAMES utf8mb4;

INSERT IGNORE INTO `permissions` (`id`, `code`, `resource`, `action`, `description`) VALUES
('00000000-0000-4000-8000-000000001069', 'accounting.read', 'accounting', 'read', 'View accounting hub and link lists'),
('00000000-0000-4000-8000-000000001070', 'accounting.chart.read', 'accounting', 'chart.read', 'View chart of accounts'),
('00000000-0000-4000-8000-000000001071', 'accounting.chart.write', 'accounting', 'chart.write', 'Manage chart of accounts'),
('00000000-0000-4000-8000-000000001072', 'accounting.journal.read', 'accounting', 'journal.read', 'View journal, general ledger and trial balance'),
('00000000-0000-4000-8000-000000001073', 'accounting.journal.write', 'accounting', 'journal.write', 'Create draft/manual journal entries'),
('00000000-0000-4000-8000-000000001074', 'accounting.post', 'accounting', 'post', 'Post fund ops to SYSCOHADA / skip links'),
('00000000-0000-4000-8000-000000001075', 'accounting.reconcile', 'accounting', 'reconcile', 'Bank/cash reconciliations (SYSCO-007)'),
('00000000-0000-4000-8000-000000001076', 'accounting.close', 'accounting', 'close', 'Lock periods and close exercises'),
('00000000-0000-4000-8000-000000001077', 'accounting.audit.read', 'accounting', 'audit.read', 'View accounting audit journal'),
('00000000-0000-4000-8000-000000001078', 'accounting.reports.read', 'accounting', 'reports.read', 'View balance sheet and P&L reports');

-- super_admin + org_admin
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`, `granted_by_user_id`)
SELECT r.`id`, p.`id`, u.`id`
FROM `permissions` p
JOIN `roles` r ON r.`id` IN (
  '00000000-0000-4000-8000-000000000100',
  '00000000-0000-4000-8000-000000000101'
)
JOIN `users` u ON u.`id` = '00000000-0000-4000-8000-000000000010'
WHERE p.`id` IN (
  '00000000-0000-4000-8000-000000001069',
  '00000000-0000-4000-8000-000000001070',
  '00000000-0000-4000-8000-000000001071',
  '00000000-0000-4000-8000-000000001072',
  '00000000-0000-4000-8000-000000001073',
  '00000000-0000-4000-8000-000000001074',
  '00000000-0000-4000-8000-000000001075',
  '00000000-0000-4000-8000-000000001076',
  '00000000-0000-4000-8000-000000001077',
  '00000000-0000-4000-8000-000000001078'
);
