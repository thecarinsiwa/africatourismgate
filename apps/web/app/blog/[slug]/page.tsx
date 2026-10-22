import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { normalizeBrandingAssetUrl } from '@africatourismgate/utils';
import { BlogDetailPageContent } from '../../../components/blog/blog-detail-page-content';
import { stripHtml } from '../../../components/shared/rich-text';
import { getBlogPostBySlugForLocale } from '../../../lib/api/public';
import {
  buildPageMetadata,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  resolveOgImageUrl,
  truncateMetaDescription,
} from '../../../lib/seo/metadata';

type PageProps = {
  params: { slug: string };
};

const defaultApiUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://app-africatourismgate.org/api'
    : 'http://localhost:3000/api';
const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? defaultApiUrl).replace(/\/$/, '');

/** High-quality fallback for shares when the post has no cover (never the favicon). */
async function getBrandingOgFallback(): Promise<string | null> {
  try {
    const response = await fetch(`${apiUrl}/organization-settings/public/branding`, {
      cache: 'no-store',
    });
    if (!response.ok) return null;
    const branding = (await response.json()) as { logoUrl?: string | null };
    return resolveOgImageUrl(normalizeBrandingAssetUrl(branding.logoUrl));
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const path = `/blog/${params.slug}`;
  const [t, locale] = await Promise.all([getTranslations('blog'), getLocale()]);

  try {
    const post = await getBlogPostBySlugForLocale(params.slug, locale);
    const fromExcerpt = post.excerpt?.trim() ?? '';
    const fromContent = stripHtml(post.content);
    const description =
      truncateMetaDescription(fromExcerpt || fromContent) || t('metaDescription');

    const cover = resolveOgImageUrl(post.coverImageUrl);
    const fallback = cover ? null : await getBrandingOgFallback();
    const imageUrl = cover ?? fallback;

    return buildPageMetadata({
      title: post.title,
      description,
      path,
      locale,
      openGraphType: 'article',
      publishedTime: post.publishedAt,
      twitterCard: 'summary_large_image',
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: OG_IMAGE_WIDTH,
              height: OG_IMAGE_HEIGHT,
              alt: post.title,
            },
          ]
        : undefined,
    });
  } catch {
    return buildPageMetadata({
      title: t('detailMetaFallbackTitle'),
      description: t('detailMetaFallbackDescription'),
      path,
      locale,
      twitterCard: 'summary_large_image',
    });
  }
}

export default function BlogDetailPage({ params }: PageProps) {
  return <BlogDetailPageContent slug={params.slug} />;
}
