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

## E2E Playwright

Specs live in [`tests/e2e/`](./tests/e2e/) (17 files). Most routes mock the API with Playwright `page.route` — no local MySQL/API required for the default suite.

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

**Last local run (2026-09-20):** **48 passed / 0 failed** (`PLAYWRIGHT_PORT=3012`, `.next-e2e` isolation ; incl. WEB-007 `car-checkout`).

### GitHub Actions

Job **`web-e2e`** in [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) (PR + `main`): install → build `types`/`utils` → Playwright Chromium → `test:e2e:ci`. On failure, uploads `playwright-report/` and `test-results/` (7-day artifact).
