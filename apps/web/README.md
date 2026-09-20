# Africa Tourism Gate — Web (`apps/web`)

Site public Next.js (App Router) + next-intl (fr / en / es).

## SEO metadata (i18n)

Locale is resolved server-side from the `atg-locale` cookie via [`i18n/request.ts`](./i18n/request.ts). Do **not** re-read the cookie in page metadata — use next-intl:

```ts
import { getLocale, getTranslations } from 'next-intl/server';
import { buildPageMetadata } from '../lib/seo/metadata';

export async function generateMetadata() {
  const [t, locale] = await Promise.all([
    getTranslations('hotels'),
    getLocale(),
  ]);
  return buildPageMetadata({
    title: t('metaTitle'),
    description: t('metaDescription'),
    path: '/hotels',
    locale,
  });
}
```

Helpers in [`lib/seo/metadata.ts`](./lib/seo/metadata.ts):

| Helper | Usage |
| --- | --- |
| `buildPageMetadata` | Public pages (title, description, OG, hreflang `?lang=`) |
| `buildListingPageMetadata` | Vertical listings (`metaTitle` / `metaDescription`) |
| `buildDetailFallbackMetadata` | Product detail when API fails |
| `buildPrivatePageMetadata` | `/account/*`, `/booking/*` + `robots: noindex` |
| `pickOgImages` | First gallery / cover URL for Open Graph |
| `openGraphLocale` | `fr_FR` / `en_US` / `es_ES` |

Root defaults live under `messages.*.meta` (`defaultTitle`, `defaultDescription`, `keywords`) and are wired in [`app/layout.tsx`](./app/layout.tsx).

## Component tests (Vitest + RTL)

Checkout / auth UI is covered with Vitest + React Testing Library (jsdom). Unit logic stays on `pnpm test` (`tsx --test` for `lib/**/*.test.ts`).

| Command | What |
| --- | --- |
| `pnpm test:components` | Vitest run (CI / one-shot) |
| `pnpm test:components:watch` | Vitest watch |

From the monorepo root:

```bash
pnpm --filter @africatourismgate/web test:components
```

Suites (WEB-009):

| File | Focus |
| --- | --- |
| [`components/reservations/checkout-stepper.test.tsx`](./components/reservations/checkout-stepper.test.tsx) | Stepper steps / current / cancelled |
| [`components/reservations/stripe-payment-error.test.tsx`](./components/reservations/stripe-payment-error.test.tsx) | Stripe error message rendering |
| [`components/reservations/booking-auth-guard.test.tsx`](./components/reservations/booking-auth-guard.test.tsx) | Auth guard redirect when unauthenticated |
| [`lib/bookings/booking-mode.component.test.ts`](./lib/bookings/booking-mode.component.test.ts) | CTA label immediate vs assisted |

Config: [`vitest.config.ts`](./vitest.config.ts), setup [`vitest.setup.ts`](./vitest.setup.ts), helpers [`test/rtl-helpers.tsx`](./test/rtl-helpers.tsx). Component suites use `*.component.test.ts` under `lib/bookings/` so they do not collide with `tsx --test`.

**Last local run (2026-09-20):** **14 passed / 0 failed**.

## Accessibility (a11y)

PR checklist : [`docs/web-a11y-checklist.md`](../../docs/web-a11y-checklist.md) (WEB-010).

| Surface | Notes |
| --- | --- |
| Header mobile | Focus trap, Escape, `aria-expanded`, touch ≥ 44px, `focus-visible` |
| Galerie hôtel | Lightbox dialog + trap ; hero / thumbs `focus-visible` |
| `/booking/login` | Labels, alertes ; Google OAuth désactivé tant que l’URL n’est pas prête |
| `/support` FAQ | Accordion `aria-expanded`, Enter/Space, `min-h-[44px]` |
| Checkout | Stepper `aria-current="step"` ; dialogs manifeste Escape + trap |
| Booking drawer | Escape + trap Tab (`BookingSidebarMobileDrawer`) |

Helpers focus : `trapFocus` / `getInitialFocusElement` exportés depuis `@africatourismgate/ui`.

## Listing errors (WEB-011)

Quand l’API est down, les listings affichent un `EmptyState` (`ListingErrorState`) avec **Réessayer** + **Retour à l’accueil** — pas de crash 500 ni grille vide trompeuse.

| Surface | Comportement |
| --- | --- |
| `/hotels` … `/packages` | Catch client → `ListingErrorState` |
| `/search/[type]` | SSR `{ items, failed }` → erreur vs empty distincts |

E2E : [`tests/e2e/listing-api-error.spec.ts`](./tests/e2e/listing-api-error.spec.ts) (mock 503 hotels + flights).

## E2E Playwright

Specs live in [`tests/e2e/`](./tests/e2e/) (19 files). Most routes mock the API with Playwright `page.route` — no local MySQL/API required for the default suite.

### Why `test:e2e:ci`?

Running against a stale `.next` cache under `pnpm dev` can throw Next.js **vendor-chunks** errors (e.g. on `package-checkout.spec.ts`). The reliable path is **build then production server**.

`test:e2e:ci` / `test:e2e:loyalty` build into **`.next-e2e`** (`NEXT_DIST_DIR`) so a concurrent `pnpm dev` on `:3002` cannot corrupt the production server mid-suite (`webpack-runtime` / `Cannot read properties of undefined (reading 'call')`).

| Command | Server | When |
| --- | --- | --- |
| `pnpm test:e2e` | `pnpm dev` (:3002) | Local DX / iteration |
| `pnpm test:e2e:ci` | build → `.next-e2e` + `next start` | Local CI parity / before PR |
| `pnpm test:e2e:loyalty` | build → `.next-e2e` + `next start` :3099 | Isolated loyalty spec |

Optional: `PLAYWRIGHT_PORT=3012` (and matching `PLAYWRIGHT_BASE_URL`) if `:3002` is already taken.

From the monorepo root:

```bash
pnpm --filter @africatourismgate/web test:e2e:ci
```

[`playwright.config.ts`](./playwright.config.ts) selects `next start` when `CI=true` or when the npm lifecycle is `test:e2e:ci`.

**Last local run (2026-09-20):** **49 passed / 0 failed** (`PLAYWRIGHT_PORT=3012`, `.next-e2e` ; WEB-007 car + WEB-008 marketing smoke).

### GitHub Actions

Job **`web-e2e`** in [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) (PR + `main`): install → build `types`/`utils` → Playwright Chromium → `test:e2e:ci`. On failure, uploads `playwright-report/` and `test-results/` (7-day artifact).
