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
