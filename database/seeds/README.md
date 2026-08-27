# Database seeds — installation

Deployments run `pnpm db:sync` after the app build and before the PM2 restart. That command applies pending migrations and then replays `install.seed.sql` in insert-only mode: new rows are inserted, existing rows with the same primary/unique key are left unchanged, and non-insert statements are skipped.

The API startup bootstrap still imports this file when `DATABASE_AUTO_SEED=true` and the platform organization is missing. In production, prefer `pnpm db:sync` through the deployment scripts.

## Default credentials

| Field | Value |
| ----- | ----- |
| Email | `admin@africatourismgate.local` |
| Password | `ChangeMe123!` |

Change this password immediately after first login in production.

For API integration scripts (`pnpm --filter @africatourismgate/api test:*`), set the same value in `.env.local` (gitignored):

```env
SEED_ADMIN_PASSWORD=your_seed_password_here
```

## What is seeded

| # | Table | Content |
| - | ----- | ------- |
| 1 | `permissions` | 28 platform permissions (`resource` + `action`) |
| 2 | `roles` | `super_admin`, `org_admin`, `support`, `customer` (`is_system = 1`) |
| 3 | `organizations` | Platform org + `Kinshasa Guichet Est` (POS multi-tenant) |
| 4 | `users` | Super admin account |
| 5 | `role_permissions` | Permission matrix per role |
| 6 | `organization_settings` | Locale, booking, branding JSON (both orgs) |
| 7 | `user_role_assignments` | Super admin → `super_admin` (global) |
| 8 | `amenities` | Wi-Fi, pool, parking, etc. |
| 9 | `vehicle_categories` | Economy → Premium |
| 10 | `organization_bank_accounts` | Sample B2B bank account |
| 11 | `airlines`, `airports`, `cruise_lines`, `cruise_ports` | Minimal flight/cruise referentials |
| 12 | Demo | Kinshasa destination, demo hotel + room |
| 13 | POS-3 | Activité exclusive Guichet Est (`organization_id` = 2e org) |
| 14 | POS-6 | Code promo caisse `POSWELCOME10` (−10 %, table `promo_codes`) |

Fixed UUIDs are documented in [seed-ids.txt](seed-ids.txt).

### POS promo code (manual test)

After `pnpm db:sync`, use code **`POSWELCOME10`** on the POS sale cart (`/sale`) to verify a 10 % discount on checkout-preview and booking creation (cash or card).

## Manual sync

```bash
pnpm db:sync
```

## Disable auto-seed

```env
DATABASE_AUTO_SEED=false
```
