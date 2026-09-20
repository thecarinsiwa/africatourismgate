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

export const SEO_LOCALES = ['fr', 'en', 'es'] as const;

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
