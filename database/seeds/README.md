# Database seeds — installation

Applied automatically on API startup when `DATABASE_AUTO_SEED=true` and the `users` table is empty (after schema import).

## Default credentials

| Field | Value |
| ----- | ----- |
| Email | `admin@africatourismgate.local` |
| Password | `ChangeMe123!` |

Change this password immediately after first login in production.

## What is seeded

| # | Table | Content |
| - | ----- | ------- |
| 1 | `permissions` | 28 platform permissions (`resource` + `action`) |
| 2 | `roles` | `super_admin`, `org_admin`, `support`, `customer` (`is_system = 1`) |
| 3 | `organizations` | Default platform organization |
| 4 | `users` | Super admin account |
| 5 | `role_permissions` | Permission matrix per role |
| 6 | `organization_settings` | Locale, booking, branding JSON |
| 7 | `user_role_assignments` | Super admin → `super_admin` (global) |
| 8 | `amenities` | Wi-Fi, pool, parking, etc. |
| 9 | `vehicle_categories` | Economy → Premium |
| 10 | `organization_bank_accounts` | Sample B2B bank account |
| 11 | `airlines`, `airports`, `cruise_lines`, `cruise_ports` | Minimal flight/cruise referentials |
| 12 | Demo | Kinshasa destination, demo hotel + room |

Fixed UUIDs are documented in [seed-ids.txt](seed-ids.txt).

## Manual import

```bash
mysql -u root -p africatourismgate < database/seeds/install.seed.sql
```

## Disable auto-seed

```env
DATABASE_AUTO_SEED=false
```
