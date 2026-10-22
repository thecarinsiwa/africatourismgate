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
import { normalizeBrandingAssetUrl } from '@africatourismgate/utils';
import { getLocale, getTranslations } from 'next-intl/server';

export const SEO_LOCALES = ['fr', 'en', 'es'] as const;

/** Recommended Open Graph / Twitter large-card dimensions. */
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

export type OgImageInput =
  | string
  | {
      url: string;
      width?: number;
      height?: number;
      alt?: string;
    };

export type ListingMetaNamespace =
  | 'hotels'
  | 'flights'
  | 'cars'
  | 'cruises'
  | 'activities'
  | 'packages'
  | 'partners';

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
  images?: OgImageInput[];
  robots?: Metadata['robots'];
  twitterCard?: 'summary' | 'summary_large_image';
  openGraphType?: 'website' | 'article';
  publishedTime?: string | null;
};

type ResolvedOgImage = {
  url: string;
  width: number;
  height: number;
  alt?: string;
};

function normalizeOgImages(images?: OgImageInput[]): ResolvedOgImage[] | undefined {
  if (!images?.length) return undefined;
  const normalized: ResolvedOgImage[] = [];
  for (const image of images) {
    if (typeof image === 'string') {
      const url = resolveOgImageUrl(image);
      if (url) {
        normalized.push({ url, width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT });
      }
      continue;
    }
    const url = resolveOgImageUrl(image.url);
    if (!url) continue;
    normalized.push({
      url,
      width: image.width ?? OG_IMAGE_WIDTH,
      height: image.height ?? OG_IMAGE_HEIGHT,
      ...(image.alt ? { alt: image.alt } : {}),
    });
  }
  return normalized.length > 0 ? normalized : undefined;
}

/**
 * Absolute HTTPS URL suitable for social cards.
 * Rejects favicons (.ico) — crawlers render them as tiny / broken previews.
 */
export function resolveOgImageUrl(url: string | null | undefined): string | null {
  const absolute = normalizeBrandingAssetUrl(url);
  if (!absolute) return null;
  if (/\.ico(?:\?|#|$)/i.test(absolute)) return null;
  return absolute;
}

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
    openGraphType = 'website',
    publishedTime,
  } = input;

  const ogImages = normalizeOgImages(images);
  const twitterImages = ogImages?.map((image) => image.url);

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
      type: openGraphType,
      ...(locale ? { locale: openGraphLocale(locale) } : {}),
      ...(ogImages ? { images: ogImages } : {}),
      ...(openGraphType === 'article' && publishedTime
        ? { publishedTime }
        : {}),
    },
    twitter: {
      card: twitterCard,
      title,
      description,
      ...(twitterImages?.length ? { images: twitterImages } : {}),
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

export const PRIVATE_PAGE_ROBOTS: NonNullable<Metadata['robots']> = {
  index: false,
  follow: false,
};

/** Account / booking flows: i18n title + noindex. */
export async function buildPrivatePageMetadata(
  namespace: 'account' | 'booking',
  metaKey: string,
  path: string,
): Promise<Metadata> {
  const [t, locale] = await Promise.all([
    getTranslations(namespace),
    getLocale(),
  ]);
  return buildPageMetadata({
    title: t(`meta.${metaKey}.title`),
    description: t(`meta.${metaKey}.description`),
    path,
    locale,
    robots: PRIVATE_PAGE_ROBOTS,
  });
}

/** First usable image URL from gallery arrays and/or a cover URL. */
export function pickOgImages(
  images?: ReadonlyArray<{ url?: string | null }> | null,
  coverUrl?: string | null,
): string[] | undefined {
  const cover = resolveOgImageUrl(coverUrl);
  if (cover) return [cover];
  for (const image of images ?? []) {
    const resolved = resolveOgImageUrl(image.url);
    if (resolved) return [resolved];
  }
  return undefined;
}

export function truncateMetaDescription(text: string, max = 160): string {
  const trimmed = text.trim().replace(/\s+/g, ' ');
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}
