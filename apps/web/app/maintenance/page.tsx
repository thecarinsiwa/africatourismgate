import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { MaintenancePage } from '../../components/maintenance-page';
import { getPublicSiteMaintenance } from '../../lib/api/public-site-maintenance';
import { buildPageMetadata, PRIVATE_PAGE_ROBOTS } from '../../lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  const [t, locale, maintenance] = await Promise.all([
    getTranslations('maintenance'),
    getLocale(),
    getPublicSiteMaintenance(),
  ]);
  const title =
    maintenance.localeFallback || !maintenance.title?.trim()
      ? t('metaTitle')
      : maintenance.title.trim();
  const description =
    maintenance.localeFallback || !maintenance.message?.trim()
      ? t('metaDescription')
      : maintenance.message.trim();
  return buildPageMetadata({
    title,
    description,
    path: '/maintenance',
    locale,
    robots: PRIVATE_PAGE_ROBOTS,
  });
}

export default async function MaintenanceRoute() {
  const maintenance = await getPublicSiteMaintenance();

  return (
    <MaintenancePage
      title={maintenance.title}
      message={maintenance.message}
      endsAt={maintenance.endsAt}
      localeFallback={maintenance.localeFallback}
    />
  );
}
