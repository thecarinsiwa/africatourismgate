# `@africatourismgate/api`

NestJS HTTP API for Africa Tourism Gate.

## Scripts

| Command   | Description                    |
| --------- | ------------------------------ |
| `pnpm dev` | `nest start --watch`          |
| `pnpm build` | Compile to `dist/`        |
| `pnpm start` | Run compiled `dist/main` |

## Configuration

Environment variables (see root `.env.example`):

- `API_PORT` (default `3000`)
- `API_GLOBAL_PREFIX` (default `api`)
- `CORS_ORIGIN` — optional comma-separated list of allowed origins

## Health check

After `pnpm dev`: [http://localhost:3000/api/health](http://localhost:3000/api/health)
