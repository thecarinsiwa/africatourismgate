-- TRESO-008 — Permissions RBAC module Trésorerie
SET NAMES utf8mb4;

INSERT IGNORE INTO `permissions` (`id`, `code`, `resource`, `action`, `description`) VALUES
('00000000-0000-4000-8000-000000001057', 'treasury.read', 'treasury', 'read', 'View treasury module (lists, details, hub)'),
('00000000-0000-4000-8000-000000001058', 'treasury.entries.write', 'treasury', 'entries.write', 'Create and update fund entries'),
('00000000-0000-4000-8000-000000001059', 'treasury.exits.write', 'treasury', 'exits.write', 'Create and update fund exits'),
('00000000-0000-4000-8000-000000001060', 'treasury.expense_requests.create', 'treasury', 'expense_requests.create', 'Create and submit expense requests (états de besoin)'),
('00000000-0000-4000-8000-000000001061', 'treasury.expense_requests.validate', 'treasury', 'expense_requests.validate', 'Validate expense requests'),
('00000000-0000-4000-8000-000000001062', 'treasury.expense_requests.authorize', 'treasury', 'expense_requests.authorize', 'Authorize expense requests for disbursement'),
('00000000-0000-4000-8000-000000001063', 'treasury.budgets.write', 'treasury', 'budgets.write', 'Manage treasury budgets'),
('00000000-0000-4000-8000-000000001064', 'treasury.reports.read', 'treasury', 'reports.read', 'View treasury reports and exports'),
('00000000-0000-4000-8000-000000001065', 'treasury.externals.manage', 'treasury', 'externals.manage', 'Invite and manage external treasury collaborators'),
('00000000-0000-4000-8000-000000001066', 'treasury.void', 'treasury', 'void', 'Void fund entries and fund exits'),
('00000000-0000-4000-8000-000000001067', 'treasury.audit.read', 'treasury', 'audit.read', 'View treasury audit journal'),
('00000000-0000-4000-8000-000000001068', 'treasury.accounting_link.read', 'treasury', 'accounting_link.read', 'View accounting bridge stub links');

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
  '00000000-0000-4000-8000-000000001057',
  '00000000-0000-4000-8000-000000001058',
  '00000000-0000-4000-8000-000000001059',
  '00000000-0000-4000-8000-000000001060',
  '00000000-0000-4000-8000-000000001061',
  '00000000-0000-4000-8000-000000001062',
  '00000000-0000-4000-8000-000000001063',
  '00000000-0000-4000-8000-000000001064',
  '00000000-0000-4000-8000-000000001065',
  '00000000-0000-4000-8000-000000001066',
  '00000000-0000-4000-8000-000000001067',
  '00000000-0000-4000-8000-000000001068'
);
