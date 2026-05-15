# Database — Africa Tourism Gate

## Requirements

- **MySQL 8.0+** or **MariaDB 10.3+** (recommended; uses `CHECK` on `reviews.rating` and modern defaults)
- User with permission to create databases, or run the script as `root` for local development

## Create the schema

From the repository root:

```bash
mysql -u root -p < database/africatourismgate_database.sql
```

This will:

1. Drop the database `africatourismgate` if it already exists
2. Create `africatourismgate` with `utf8mb4` / `utf8mb4_unicode_ci`
3. Create all tables, primary keys, and foreign keys

## Configure the app

Point NestJS (or your ORM) at:

- **Host / port / user / password**: your MySQL instance
- **Database name**: `africatourismgate`

Primary keys are **CHAR(36)** UUIDs: generate IDs in the application (e.g. `uuid` in Node) on insert.

## Table index

See [africatourismgate_database_tables.txt](africatourismgate_database_tables.txt) for a list of tables grouped by domain.

## RBAC

- **`permissions`**: stable `code` plus `resource` + `action` (unique pair) for checks in NestJS.
- **`roles`** / **`role_permissions`**: many-to-many; optional `granted_by_user_id` on bindings.
- **`user_role_assignments`**: grants with `assigned_by_user_id`, optional `expires_at`, soft revoke via `revoked_at` / `revoked_by_user_id` / `revoke_reason`; optional `scope_type` + `scope_id` for scoped admin (e.g. one property or agency). Effective roles: `revoked_at IS NULL` and (`expires_at` IS NULL or future).
- **`rbac_audit_logs`**: append-only trail (`event_type`, `actor_user_id`, targets, `payload` JSON, IP, user agent). NestJS should insert a row on each grant/revoke and role/permission change.

## Audit columns (all business tables)

Every table includes:

| Column | Purpose |
|--------|---------|
| `created_by_user_id` | User who created the row (`create_by` in APIs) |
| `updated_by_user_id` | User who last updated the row (`edit_by`) |
| `deleted_by_user_id` | User who soft-deleted the row (`delete_by`) |
| `created_at` | Creation time |
| `updated_at` | Last update time (`edit_at`); nullable until first update |
| `deleted_at` | Soft delete time (`delete_at`); `NULL` means active |

All `*_by_user_id` columns reference `users(id)` with `ON DELETE SET NULL`. List queries should filter `deleted_at IS NULL` unless you need history.

## Seeds

Installation data (RBAC, default org, admin user, referentials, demo catalog) lives in [seeds/](seeds/README.md). The API imports `seeds/install.seed.sql` on startup when no users exist (`DATABASE_AUTO_SEED=true`).

## Notes

- `package_items` and `booking_items` use polymorphic `item_type` / `reference_id` (no single FK to all product tables).
- `bookings.promo_code_id` references `promo_codes` after both tables are created (FK added via `ALTER TABLE`).
