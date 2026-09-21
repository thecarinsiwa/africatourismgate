# Database seeds — installation

Deployments run `pnpm db:sync` after the app build and before the PM2 restart. That command applies pending migrations and then replays the selected seed file in insert-only mode: new rows are inserted, existing rows with the same primary/unique key are left unchanged, and non-insert statements are skipped.

| Profile | File | When |
|---------|------|------|
| **dev** (default) | [`install.seed.sql`](./install.seed.sql) | Local / staging with demo catalog |
| **prod** | [`install.seed.prod.sql`](./install.seed.prod.sql) | Bootstrap prod — 8 tables uniquement (RBAC + org + settings + amenities) |

```bash
# Dev / demo (default)
pnpm db:sync

# Production minimal seed
SEED_PROFILE=prod pnpm db:sync
# or
DATABASE_SEED_FILE=install.seed.prod.sql pnpm db:sync

# Full prepare flow (check / purge / fresh / install-only)
pnpm db:prepare-prod -- --mode=check
pnpm db:prepare-prod -- --mode=fresh
# Production: empty all tables except install seed
pnpm db:prod-install-only -- --backup

# Sync production without CMS/demo migration inserts
pnpm db:sync:prod
```

The API startup bootstrap still imports the seed when `DATABASE_AUTO_SEED=true` and the platform organization is missing. It honors `SEED_PROFILE` / `DATABASE_SEED_FILE` the same way. In production, prefer `pnpm db:sync` through the deployment scripts, then set `DATABASE_AUTO_SEED=false`.

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

## What is seeded (dev — `install.seed.sql`)

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

## What is seeded (prod — `install.seed.prod.sql`)

| # | Table | Content |
| - | ----- | ------- |
| 1 | `permissions` | Platform permissions |
| 2 | `roles` | `super_admin`, `org_admin`, `support`, `customer` |
| 3 | `organizations` | Platform org only |
| 4 | `users` | Super admin |
| 5 | `role_permissions` | Permission matrix |
| 6 | `organization_settings` | Locale, booking, branding, payments… |
| 7 | `user_role_assignments` | Admin → `super_admin` |
| 8 | `amenities` | Wi-Fi, pool, parking, etc. |

No `vehicle_categories`, airlines/airports, cruise referentials, bank sample, demo catalog, Guichet Est, guides, or POS promo.

## POS promo code (manual test)

After a **dev** `pnpm db:sync`, use code **`POSWELCOME10`** on the POS sale cart (`/sale`) to verify a 10 % discount on checkout-preview and booking creation (cash or card).

## Manual sync

```bash
pnpm db:sync
```

## Disable auto-seed

```env
DATABASE_AUTO_SEED=false
```

## Production data preparation

Before go-live, do **not** rely on the demo/install seed as production catalog data. See:

- [Production database preparation](../../docs/production-data-preparation.md) — cleanup plan, data inventory, collection form, CSV templates
- [Data collection CSV templates](../../docs/data-collection/README.md)
- [database/scripts/README.md](../scripts/README.md) — `purge-demo-data.sql` + `prepare-production-db.mjs`

In production, set `DATABASE_AUTO_SEED=false` after bootstrap and keep `SEED_PROFILE=prod` (or an equivalent `DATABASE_SEED_FILE`) so `pnpm db:sync` does not re-insert demo catalog rows.
