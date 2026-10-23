# Africa Tourism Gate — Web (`apps/web`)

Site **public client** (voyageurs) : Next.js 14 App Router, React 18, **next-intl** (fr / en / es), Tailwind. Port **3002**. Consomme l’API REST (`apps/api`) via `NEXT_PUBLIC_API_URL`.

## Prérequis

- Monorepo pnpm (Node **≥ 18.18**, pnpm 9 — voir racine)
- API locale sur `:3000` recommandée pour listings / auth / booking  
  (ou `ATG_USE_REMOTE_API=1` dans `.env.local` pour proxifier vers l’API distante — voir [`.env.example`](../../.env.example))
- Copier [`.env.example`](../../.env.example) → `.env` à la **racine** du monorepo

## Variables d’environnement (minimal)

```bash
# Racine .env (extrait utile pour apps/web)
WEB_PORT=3002
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_WEB_URL=http://localhost:3002
# optionnel
# NEXT_PUBLIC_GAP_URL=http://localhost:3004
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_…
# NEXT_PUBLIC_SHOW_DEMO_TRUST_HINTS=true
# PLAYWRIGHT_PORT=3012
# PLAYWRIGHT_BASE_URL=http://127.0.0.1:3012
```

Locale UI : cookie `atg-locale` ([`i18n/request.ts`](./i18n/request.ts)). Chargement env racine : `packages/config/load-root-env.mjs` (via `next.config.mjs`).

## Commandes

Depuis la **racine** du monorepo :

```bash
pnpm dev:web                                      # next dev :3002
pnpm --filter @africatourismgate/web build
pnpm --filter @africatourismgate/web start
pnpm --filter @africatourismgate/web lint
pnpm --filter @africatourismgate/web test         # unit lib/**/*.test.ts (tsx)
pnpm --filter @africatourismgate/web test:components   # Vitest + RTL
pnpm --filter @africatourismgate/web test:e2e     # Playwright (dev server)
pnpm --filter @africatourismgate/web test:e2e:ci  # build → .next-e2e + next start
```

`test:e2e:ci` isole le build dans **`.next-e2e`** (`NEXT_DIST_DIR`) pour éviter les collisions avec un `pnpm dev` concurrent. CI : job `web-e2e-build` puis shards `web-e2e` ([`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)).

## Structure

```
app/           # routes App Router (pages, layouts, metadata)
components/    # UI par domaine (home, hotels, booking, account, about…)
lib/           # API public, auth session, search, i18n helpers, SEO
messages/      # next-intl fr.json / en.json / es.json
i18n/          # config next-intl (request, routing)
tests/e2e/     # Playwright (mocks API — pas de MySQL requis)
```

Packages workspace : `@africatourismgate/ui`, `api-client`, `types`, `utils`.

## Flux principaux

1. **Recherche** — home (`/#search`) → `/hotels|flights|cars|cruises|activities|packages` ou `/search/[type]`
2. **Fiche** — `/hotels/[id]`, etc. → CTA réservation (sidebar / drawer mobile)
3. **Booking** — `/booking/login|register` → verify OTP si besoin → cart / recap / paiement → success
4. **Compte** — `/account/*` (profil, réservations, fidélité, support) après session

Erreurs listing (API down) : `ListingErrorState` (réessayer + accueil). Auth guard + stepper : Vitest.

## SEO (rappel)

Ne pas relire le cookie dans `generateMetadata` : `getLocale` / `getTranslations` + helpers [`lib/seo/metadata.ts`](./lib/seo/metadata.ts).

## Accessibilité

Checklist PR : [`docs/web-a11y-checklist.md`](../../docs/web-a11y-checklist.md).

## Docs

- [`docs/web-github-tasks.md`](../../docs/web-github-tasks.md) — backlog web (WEB-*)
- [`docs/web-design-improvements.md`](../../docs/web-design-improvements.md) — WEB-UX
- [`docs/roadmap-post-reunion-08-2026.md`](../../docs/roadmap-post-reunion-08-2026.md) — roadmap produit
- [`docs/roadmap-development.md`](../../docs/roadmap-development.md) — roadmap technique
- README monorepo : [`../../README.md`](../../README.md)
