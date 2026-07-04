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
| `pnpm test:e2e` | Jest + supertest e2e suite (health, auth, booking, Stripe webhook mock) |
| `pnpm openapi:export` | Write `apps/api/openapi.json` from Nest Swagger (needs MySQL) |
| `pnpm test:email` | Send reset, welcome, and booking confirmation emails (needs Mailpit or Ethereal) |

## Email (SMTP / Mailpit / Ethereal)

Transactional HTML emails via `src/modules/email/` (nodemailer):

| Événement | Destinataire | Déclencheur |
| --------- | ------------ | ----------- |
| Réinitialisation mot de passe | Client | `POST /auth/forgot-password` |
| Bienvenue | Client | `POST /auth/register` |
| Nouveau compte | Support (`EMAIL_SUPPORT_TO`) | `POST /auth/register` |
| Confirmation réservation | Client | `confirmBooking` (cash POS, admin confirm, Stripe webhook) |
| Réservation confirmée | Support (`EMAIL_SUPPORT_TO`) | `confirmBooking` |

Variables (voir root `.env.example`) :

| Variable | Rôle |
| -------- | ---- |
| `EMAIL_ENABLED` | `true` / `false` |
| `EMAIL_TRANSPORT` | `mailpit` (dev), `smtp` (prod LWS) |
| `EMAIL_FROM` | Expéditeur compte **service@** (clients) |
| `SMTP_SERVICE_USER` / `SMTP_SERVICE_PASS` | Auth SMTP `service@africatourismgate.org` |
| `EMAIL_SUPPORT_FROM` | Expéditeur alertes internes |
| `EMAIL_SUPPORT_TO` | Destinataire alertes (`support@africatourismgate.org`) |
| `SMTP_SUPPORT_USER` / `SMTP_SUPPORT_PASS` | Auth SMTP `support@africatourismgate.org` |
| `SMTP_HOST` | `mail.africatourismgate.org` (ou `mail93.lwspanel.com`) |
| `SMTP_PORT` / `SMTP_SECURE` | `465` + `true` (SSL) ou `587` + `false` (TLS) |

Les mots de passe des boîtes mail vont dans `.env.local` (dev) ou `.env` VPS — **jamais** commités.

**Dev (Mailpit)** — capture SMTP sans envoi réel :

```bash
# Install: https://github.com/axllent/mailpit
mailpit
# UI http://localhost:8025 — SMTP localhost:1025
pnpm dev:api
pnpm --filter @africatourismgate/api test:email
```

**Dev (Ethereal)** — compte de test jetable :

```bash
EMAIL_TRANSPORT=ethereal pnpm dev:api
```

Si l’envoi échoue (SMTP arrêté), l’API logue un avertissement et continue (pas de crash). En dev, le lien de reset reste aussi dans les logs si l’e-mail n’a pas pu partir.

## OpenAPI → typed client (`pnpm codegen:api`)

From the **repo root**, regenerate `packages/api-client/src/generated/` from this API’s Swagger document:

```bash
pnpm install
pnpm codegen:api
```

The codegen script resolves the spec in this order:

1. `OPENAPI_SPEC` — path to a local `openapi.json`
2. **Running API** — `GET` `OPENAPI_URL` (default `http://127.0.0.1:3000/api-json`) and saves `apps/api/openapi.json`
3. Existing `apps/api/openapi.json` (committed snapshot)
4. `pnpm --filter @africatourismgate/api openapi:export` (Nest bootstrap; requires MySQL + `.env`)

Use `--refresh-spec` to force re-download or re-export before codegen.

**Typage login :** après codegen, `LoginRequestBody` / `LoginResponseBody` et `openApiLogin()` sont dérivés de `POST /auth/login` dans le schéma OpenAPI. Le client manuel `ApiClient.login()` reste inchangé pour l’admin/POS.

```ts
import {
  createOpenApiClient,
  openApiBaseUrl,
  openApiLogin,
} from '@africatourismgate/api-client';

// OpenAPI paths include `/api`; use the server origin (not NEXT_PUBLIC_API_URL’s `/api` suffix).
const client = createOpenApiClient({
  baseUrl: openApiBaseUrl(process.env.NEXT_PUBLIC_API_URL!),
});
const { data, error } = await openApiLogin(client, {
  email: 'admin@africatourismgate.local',
  password: 'ChangeMe123!',
});
```

Commit `apps/api/openapi.json` when API routes or DTOs change so CI can codegen without a running server.

## E2E tests (Jest + supertest)

Prerequisites:

- MySQL reachable with credentials from root `.env` / `.env.local`
- `DATABASE_NAME` is forced to `africatourismgate_test` during e2e (override via `E2E_DATABASE_NAME`)
- `SEED_ADMIN_PASSWORD` matching the seeded admin (`database/seeds/README.md`)
- Optional: `STRIPE_WEBHOOK_SECRET` — if unset, webhook signature tests use a local test secret

On first run against an empty test database, startup imports schema and seeds (`DATABASE_AUTO_SCHEMA` / `DATABASE_AUTO_SEED`, same as dev).

```bash
# From repo root
DATABASE_NAME=africatourismgate_test pnpm --filter @africatourismgate/api test:e2e

# Or from apps/api
pnpm test:e2e
```

Specs live in `apps/api/test/e2e/` (`health`, `auth`, `booking`, `stripe-webhook`, `stripe-booking-confirm`).

## Stripe (paiement + webhooks)

La confirmation d’une réservation (`pending_payment` → `confirmed`) passe par le webhook Stripe. **En local, sans forwarding, le paiement Checkout réussit côté Stripe mais le statut reste bloqué.**

### Prérequis

| Variable | Rôle |
| -------- | ---- |
| `STRIPE_SECRET_KEY` | Clé secrète test (`sk_test_…`) |
| `STRIPE_WEBHOOK_SECRET` | Secret du endpoint webhook (`whsec_…`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Clé publique côté web (optionnel selon flux) |

### Dev local (obligatoire pour Checkout)

Dans un terminal dédié :

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copier le `whsec_…` affiché dans `STRIPE_WEBHOOK_SECRET` (`.env` ou `.env.local`), puis **redémarrer l’API**.

Sans `stripe listen`, utilisez le repli client :

- `POST /api/bookings/:id/sync-payment` (après retour Checkout, appelé par la page succès)
- ou `POST /api/bookings/:id/confirm` (staff / contournement manuel)

### Scripts de test

```bash
pnpm --filter @africatourismgate/api test:stripe-payment
pnpm --filter @africatourismgate/api test:stripe-refund
```

### Production

Configurer dans le [Dashboard Stripe → Webhooks](https://dashboard.stripe.com/webhooks) l’URL :

`https://app-africatourismgate.org/api/stripe/webhook`

Événements : `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`, `refund.updated`, `charge.refunded`.

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
- **Swagger UI**: `http://localhost:3000/api`
- **OpenAPI JSON**: `http://localhost:3000/api-json` (source for `pnpm codegen:api`)
- **Resources**: one REST controller per table (e.g. `GET /api/destinations`, `GET /api/properties/:id`)

All list queries exclude soft-deleted rows (`deleted_at IS NULL` via TypeORM).  
Composite primary keys (`role-permissions`, `property-amenities`) use two path segments for delete.

## Architecture

- `src/entities/generated/` — TypeORM entities (generated from SQL)
- `src/modules/resources/` — CRUD modules per entity
- `src/common/` — audit base entity, pagination DTO, shared `CrudService`

After changing `database/africatourismgate_database.sql`, run `pnpm generate` inside `apps/api`.
