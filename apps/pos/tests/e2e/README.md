# Tests E2E POS (Playwright)

Parcours bout-en-bout de la caisse : connexion employé, vente espèces, historique.

## Prérequis

- Node 20+, pnpm
- MySQL local avec schéma synchronisé et seed installé :

```bash
pnpm db:sync
```

- Variables d’environnement (racine ou `.env`) :

  - `DATABASE_*` pour l’API
  - `SEED_ADMIN_PASSWORD=ChangeMe123!` (ou valeur seed)
  - `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` (min. 32 caractères)
  - `NEXT_PUBLIC_API_URL=http://localhost:3000/api`

## Lancer les tests

Installez Chromium Playwright une première fois :

```bash
pnpm --filter @africatourismgate/pos exec playwright install chromium
```

Depuis la racine du monorepo :

```bash
pnpm --filter @africatourismgate/pos test:e2e
```

Playwright démarre automatiquement l’API (`:3000`) et le POS (`:3003`) sauf si des serveurs tournent déjà en local (`reuseExistingServer`).

Interface Playwright :

```bash
pnpm --filter @africatourismgate/pos exec playwright test --ui
```

## Specs

| Fichier | Scénario |
|---------|----------|
| `auth-flow.spec.ts` | Login UI → sélection établissement → accueil |
| `cash-sale.spec.ts` | Vente chambre seed en espèces → page success + reçu |
| `history.spec.ts` | Vente cash visible dans l’historique du jour |

## Données seed

- Compte : `admin@africatourismgate.local` / `ChangeMe123!`
- Chambre : `Standard Double` (`2099-12-01` → `2099-12-02`, dispo créée au setup si absente)
- Organisation par défaut : `Africa Tourism Gate`

## CI

Le job GitHub Actions `pos` exécute lint, build et `test:e2e` avec MySQL de service.
