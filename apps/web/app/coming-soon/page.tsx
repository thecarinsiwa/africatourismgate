import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { ComingSoonPage } from '../../components/coming-soon-page';
import { buildPageMetadata, PRIVATE_PAGE_ROBOTS } from '../../lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  const [t, locale] = await Promise.all([
    getTranslations('comingSoon'),
    getLocale(),
  ]);
  return buildPageMetadata({
    title: t('metaTitle'),
    description: t('metaDescription'),
    path: '/coming-soon',
    locale,
    robots: PRIVATE_PAGE_ROBOTS,
  });
}

export default function ComingSoonRoute() {
  return <ComingSoonPage />;
}
