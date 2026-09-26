-- Revoke staff support ticket permissions from the customer role.
-- Customers access their own tickets via ownership (GET/POST /support-tickets/:id[/messages]),
-- not support_tickets.read / support_tickets.write (admin inbox + staff replies).

UPDATE `role_permissions`
SET `deleted_at` = CURRENT_TIMESTAMP,
    `deleted_by_user_id` = '00000000-0000-4000-8000-000000000010'
WHERE `role_id` = '00000000-0000-4000-8000-000000000103'
  AND `permission_id` IN (
    '00000000-0000-4000-8000-000000001021',
    '00000000-0000-4000-8000-000000001022'
  )
  AND `deleted_at` IS NULL;
