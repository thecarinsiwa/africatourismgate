import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { MediaGallery } from '@/components/media-gallery';
import { listGapMediaForLocale } from '@/lib/api/public-gap';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('media');
  return { title: t('title'), description: t('subtitle') };
}

export default async function MediaPage() {
  const locale = await getLocale();
  const media = await listGapMediaForLocale({ locale, limit: 24 }).catch(() => ({
    data: [],
    meta: { total: 0, page: 1, limit: 24, totalPages: 0 },
  }));
  return <MediaGallery items={media.data} />;
}
