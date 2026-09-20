/**
 * SEO metadata helpers (WEB-005).
 *
 * Locale is resolved by next-intl from the `atg-locale` cookie
 * (`apps/web/i18n/request.ts`). In `generateMetadata`, call
 * `getTranslations` / `getLocale` from `next-intl/server`, then use
 * `buildPageMetadata` (or `openGraphLocale` for the root layout).
 *
 * See `apps/web/README.md` § SEO metadata.
 */
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';

export const SEO_LOCALES = ['fr', 'en', 'es'] as const;

export type ListingMetaNamespace =
  | 'hotels'
  | 'flights'
  | 'cars'
  | 'cruises'
  | 'activities'
  | 'packages';

export function openGraphLocale(locale: string): string {
  if (locale === 'en') return 'en_US';
  if (locale === 'es') return 'es_ES';
  return 'fr_FR';
}

/** Split a comma-separated keywords string from messages into a Metadata keywords array. */
export function parseMetaKeywords(keywords: string): string[] {
  return keywords
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

export function buildLanguageAlternates(
  canonicalPath: string,
): Record<string, string> {
  return Object.fromEntries(
    SEO_LOCALES.map((lang) => [lang, `${canonicalPath}?lang=${lang}`]),
  );
}

export type BuildPageMetadataInput = {
  title: string;
  description: string;
  path: string;
  locale?: string;
  images?: string[];
  robots?: Metadata['robots'];
  twitterCard?: 'summary' | 'summary_large_image';
};

/** Shared title / description / OG / alternates for App Router pages. */
export function buildPageMetadata(input: BuildPageMetadataInput): Metadata {
  const {
    title,
    description,
    path,
    locale,
    images,
    robots,
    twitterCard = 'summary',
  } = input;

  return {
    title,
    description,
    alternates: {
      canonical: path,
      languages: buildLanguageAlternates(path),
    },
    openGraph: {
      title,
      description,
      url: path,
      type: 'website',
      ...(locale ? { locale: openGraphLocale(locale) } : {}),
      ...(images?.length ? { images } : {}),
    },
    twitter: {
      card: twitterCard,
      title,
      description,
      ...(images?.length ? { images } : {}),
    },
    ...(robots ? { robots } : {}),
  };
}

/** Listing pages: `metaTitle` / `metaDescription` from the vertical namespace. */
export async function buildListingPageMetadata(
  namespace: ListingMetaNamespace,
  path: string,
): Promise<Metadata> {
  const [t, locale] = await Promise.all([
    getTranslations(namespace),
    getLocale(),
  ]);
  return buildPageMetadata({
    title: t('metaTitle'),
    description: t('metaDescription'),
    path,
    locale,
  });
}

/** Fallback metadata when a product detail cannot be loaded. */
export async function buildDetailFallbackMetadata(
  namespace: ListingMetaNamespace,
  path: string,
): Promise<Metadata> {
  const [t, locale] = await Promise.all([
    getTranslations(namespace),
    getLocale(),
  ]);
  return buildPageMetadata({
    title: t('detailMetaFallbackTitle'),
    description: t('detailMetaFallbackDescription'),
    path,
    locale,
  });
}

/** First usable image URL from gallery arrays and/or a cover URL. */
export function pickOgImages(
  images?: ReadonlyArray<{ url?: string | null }> | null,
  coverUrl?: string | null,
): string[] | undefined {
  if (coverUrl?.trim()) return [coverUrl.trim()];
  const first = images?.find((image) => image.url?.trim())?.url?.trim();
  return first ? [first] : undefined;
}

export function truncateMetaDescription(text: string, max = 160): string {
  const trimmed = text.trim().replace(/\s+/g, ' ');
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}
