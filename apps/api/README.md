# `@africatourismgate/api`

NestJS HTTP API for Africa Tourism Gate, mapped to the MySQL schema in `database/africatourismgate_database.sql`.

## Scripts

| Command | Description |
| ------- | ----------- |
| `pnpm dev` | `nest start --watch` |
| `pnpm build` | Compile to `dist/` |
| `pnpm start` | Run compiled `dist/main` |
| `pnpm generate` | Regenerate TypeORM entities + CRUD modules from SQL |

## Configuration

Environment variables (see root `.env.example`):

- `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME`
- `API_PORT` (default `3000`)
- `API_GLOBAL_PREFIX` (default `api`)
- `CORS_ORIGIN` — optional comma-separated list of allowed origins

On **application startup** (not `nest build`), the API:

1. Runs `CREATE DATABASE IF NOT EXISTS` for `DATABASE_NAME`
2. If `DATABASE_AUTO_SCHEMA=true` (default) and the database has **no tables**, imports `database/africatourismgate_database.sql`

To disable automatic schema import: `DATABASE_AUTO_SCHEMA=false` in `.env`.

Manual import (optional):

```bash
mysql -u root -p < database/africatourismgate_database.sql
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
