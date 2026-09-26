# @africatourismgate/api-client

HTTP client typé pour les apps (Admin, POS, web, gap).

- **Méthodes métier** : `src/index.ts` (`ApiClient`)
- **Schéma OpenAPI** : `src/generated/` (généré — ne pas éditer à la main)

```bash
pnpm --filter @africatourismgate/api openapi:export
pnpm codegen:api
pnpm --filter @africatourismgate/api-client build
```

Trésorerie Admin : voir [docs/admin-tresorerie-readme.md](../../docs/admin-tresorerie-readme.md).
