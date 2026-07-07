import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { ActivitiesPreview } from '@/components/activities-preview';
import { GapHero } from '@/components/gap-hero';
import { ImpactStatsSection } from '@/components/impact-stats-section';
import { MediaGallery } from '@/components/media-gallery';
import {
  getGapHomeForLocale,
  listGapActivitiesForLocale,
  listGapMediaForLocale,
} from '@/lib/api/public-gap';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations('meta');
  try {
    const home = await getGapHomeForLocale(locale);
    const title = home.settings?.title ?? t('siteName');
    const description = home.settings?.subtitle ?? t('defaultDescription');
    return { title, description };
  } catch {
    return {
      title: t('siteName'),
      description: t('defaultDescription'),
    };
  }
}

export default async function HomePage() {
  const locale = await getLocale();
  const [home, activities, media] = await Promise.all([
    getGapHomeForLocale(locale).catch(() => ({ settings: null, impactStats: [] })),
    listGapActivitiesForLocale(locale).catch(() => []),
    listGapMediaForLocale({ locale, limit: 6 }).catch(() => ({ data: [], meta: { total: 0, page: 1, limit: 6, totalPages: 0 } })),
  ]);

  return (
    <>
      <GapHero settings={home.settings} />
      <ImpactStatsSection stats={home.impactStats} />
      <ActivitiesPreview activities={activities} compact />
      <MediaGallery items={media.data} compact />
    </>
  );
}
