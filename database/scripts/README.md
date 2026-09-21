# Database scripts — production preparation

Orchestration for Part A of [docs/production-data-preparation.md](../../docs/production-data-preparation.md).

| File | Role |
|------|------|
| [purge-demo-data.sql](./purge-demo-data.sql) | Control SELECTs + DELETE of demo/test seed UUIDs |
| [`apps/api/scripts/prepare-production-db.mjs`](../../apps/api/scripts/prepare-production-db.mjs) | CLI: `check` / `purge` / `fresh` / `reset` / `install-only` |

## Commands

From the repository root (uses `.env` / `.env.local` like `pnpm db:sync`):

```bash
# 1) Contrôles FK / réservations liées aux UUID démo (sans DELETE)
pnpm db:prepare-prod -- --mode=check

# 2) Purge ciblée des UUID démo (staging, backup + confirmation)
pnpm db:prepare-prod -- --mode=purge --confirm --backup

# 3) Install neuve (schéma + migrations + seed, sans DROP si la DB existe)
pnpm db:prepare-prod -- --mode=fresh
pnpm db:prepare-prod -- --mode=fresh --database=africatourismgate_prod

# 4) DROP + recreate + seed prod (nettoie aussi le CMS injecté par migrations)
pnpm db:prepare-prod -- --mode=reset --confirm --backup

# 5) Commande production recommandée : vider toute la DB sauf le seed d'installation
pnpm db:prod-install-only -- --backup
# équivalent :
pnpm db:prepare-prod -- --mode=install-only --confirm --seed=prod --backup
```

`install-only` conserve uniquement :

- `permissions`, `roles`, `organizations`, `users`
- `role_permissions`, `organization_settings`, `user_role_assignments`, `amenities`
- `schema_migrations` (pour ne pas rejouer les migrations CMS)

Puis rejoue `install.seed.prod.sql` en insert-only.

## Sync production (`db:sync`)

Avec `SEED_PROFILE=prod` (ou `pnpm db:sync:prod`), `db:sync` :

1. applique le **DDL** des migrations normalement
2. **ignore** les INSERT/UPDATE/DELETE des migrations hors tables autorisées (CMS, GAP, catalogue démo, etc.)
3. n’insère le seed que dans les 8 tables d’installation

```bash
# Production (recommandé)
pnpm db:sync:prod

# ou via .env : SEED_PROFILE=prod
pnpm db:sync
```

Allowed migration data tables in prod: `permissions`, `roles`, `role_permissions`, `user_role_assignments`, `organization_settings`.

## Afterward

1. Set `DATABASE_AUTO_SEED=false`
2. Prefer `SEED_PROFILE=prod` (or `DATABASE_SEED_FILE=install.seed.prod.sql`) so `pnpm db:sync` does not re-insert the demo catalog
3. Change the bootstrap admin password (`admin@africatourismgate.local` / `ChangeMe123!`)
4. Integrate société data (CSV / admin) when status is `Validée`

Backups written with `--backup` go to `database/backups/` (gitignored).
