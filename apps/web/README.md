# Africa Tourism Gate — Web (`apps/web`)

Site public client (voyageurs) : Next.js 14 App Router, React 18, next-intl (**fr / en / es**), Tailwind. Port **3002**. Consomme l’API REST (`apps/api`) via `NEXT_PUBLIC_API_URL`.

## Prérequis

- Monorepo pnpm (Node 20+)
- API locale recommandée sur `:3000` pour listings / auth / booking
- Copier [`.env.example`](../../.env.example) à la racine en `.env` (ou surcharger localement)

## Variables d’environnement (minimal)

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_WEB_URL=http://localhost:3002
# optionnel
# NEXT_PUBLIC_SHOW_DEMO_TRUST_HINTS=true
# NEXT_PUBLIC_GAP_URL=http://localhost:3004
# PLAYWRIGHT_PORT=3012
# PLAYWRIGHT_BASE_URL=http://127.0.0.1:3012
```

`WEB_PORT` (racine) / défaut Next : **3002**. Locale UI : cookie `atg-locale` ([`i18n/request.ts`](./i18n/request.ts)).

## Commandes

Depuis la racine du monorepo :

```bash
pnpm dev:web                                    # next dev :3002
pnpm --filter @africatourismgate/web build
pnpm --filter @africatourismgate/web start
pnpm --filter @africatourismgate/web lint
pnpm --filter @africatourismgate/web test       # unit lib/**/*.test.ts (tsx)
pnpm --filter @africatourismgate/web test:components
pnpm --filter @africatourismgate/web test:e2e   # Playwright + pnpm dev
pnpm --filter @africatourismgate/web test:e2e:ci # build → .next-e2e + next start
```

`test:e2e:ci` isole le build dans **`.next-e2e`** (`NEXT_DIST_DIR`) pour éviter les collisions avec un `pnpm dev` concurrent. Job CI : `web-e2e` dans [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml).

## Structure

```
app/           # routes App Router (pages, layouts, metadata)
components/    # UI par domaine (home, hotels, booking, account, shared…)
lib/           # API client public, auth, search, i18n helpers, SEO
messages/      # next-intl fr.json / en.json / es.json
i18n/          # config next-intl (request, routing)
tests/e2e/     # Playwright (mocks API, pas de MySQL requis)
```

Packages workspace : `@africatourismgate/ui`, `api-client`, `types`, `utils`.

## Flux principaux

1. **Recherche** — home (`/#search`) → `/hotels|flights|cars|cruises|activities|packages` ou `/search/[type]`
2. **Fiche** — `/hotels/[id]`, etc. → CTA réservation (sidebar / drawer mobile)
3. **Booking** — `/booking/login` (ou register) → cart / recap / payment → success
4. **Compte** — `/account/*` (profil, réservations, fidélité) après session

Erreurs listing (API down) : `ListingErrorState` (réessayer + accueil) — WEB-011. Auth guard + stepper : tests Vitest — WEB-009.

## SEO (rappel)

Ne pas relire le cookie dans `generateMetadata` : `getLocale` / `getTranslations` + helpers [`lib/seo/metadata.ts`](./lib/seo/metadata.ts) (`buildPageMetadata`, `buildListingPageMetadata`, `buildPrivatePageMetadata`, …).

## Accessibilité

Checklist PR : [`docs/web-a11y-checklist.md`](../../docs/web-a11y-checklist.md) (WEB-010).

## Docs

- [`docs/web-github-tasks.md`](../../docs/web-github-tasks.md) — backlog web (WEB-*)
- [`docs/web-design-improvements.md`](../../docs/web-design-improvements.md) — WEB-UX
- [`docs/roadmap-post-reunion-08-2026.md`](../../docs/roadmap-post-reunion-08-2026.md) — roadmap produit
- README monorepo : [`../../README.md`](../../README.md)
