# `@africatourismgate/api`

NestJS HTTP API for Africa Tourism Gate, mapped to the MySQL schema in `database/africatourismgate_database.sql`.

## Scripts

| Command | Description |
| ------- | ----------- |
| `pnpm dev` | `nest start --watch` |
| `pnpm build` | Compile to `dist/` |
| `pnpm start` | Run compiled `dist/main` |
| `pnpm generate` | Regenerate TypeORM entities + CRUD modules from SQL |
| `pnpm db:sync` | Apply database schema migrations and insert-only seeds |
| `pnpm test:pos-sale-cash` | POS cash flow: checkout preview → booking → cash-payment (needs `SEED_ADMIN_PASSWORD`) |

## Configuration

Environment variables (see root `.env.example`):

- `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME`
- `API_PORT` (default `3000`)
- `API_GLOBAL_PREFIX` (default `api`)
- `CORS_ORIGIN` — optional comma-separated list of allowed origins

On **application startup** (not `nest build`), the API:

1. Runs `CREATE DATABASE IF NOT EXISTS` for `DATABASE_NAME`
2. If `DATABASE_AUTO_SCHEMA=true` (default) and the database has **no tables**, imports `database/africatourismgate_database.sql`
3. If `DATABASE_AUTO_SEED=true` (default) and the platform organization is missing, imports `database/seeds/install.seed.sql` (RBAC, admin, referentials, demo data)

To disable: `DATABASE_AUTO_SCHEMA=false` and/or `DATABASE_AUTO_SEED=false` in `.env`.

Deployments run `pnpm db:sync` after build and before PM2 restart. That command applies pending SQL migrations and inserts missing seed rows without modifying existing rows.

**Default admin:** `admin@africatourismgate.local` / `ChangeMe123!` — see [database/seeds/README.md](../../database/seeds/README.md).

Manual sync (optional):

```bash
pnpm db:sync
```

## Endpoints

- **Health**: `GET /api/health`
- **Swagger**: `http://localhost:3000/api`
- **Resources**: one REST controller per table (e.g. `GET /api/destinations`, `GET /api/properties/:id`)

All list queries exclude soft-deleted rows (`deleted_at IS NULL` via TypeORM).  
Composite primary keys (`role-permissions`, `property-amenities`) use two path segments for delete.

## Architecture

- `src/entities/generated/` — TypeORM entities (generated from SQL)
- `src/modules/resources/` — CRUD modules per entity
- `src/common/` — audit base entity, pagination DTO, shared `CrudService`

After changing `database/africatourismgate_database.sql`, run `pnpm generate` inside `apps/api`.
