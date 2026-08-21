'use client';

import { useTranslations } from 'next-intl';
import { CruisesStatCards } from '../cruises/cruises-stat-cards';
import { ShipsList } from '../cruises/ships-list';
import { AdminPageBackLink } from '../admin-page-back-link';
import { useSetAdminPageMeta } from '../admin-page-meta-context';
import { AdminListPageHeader } from './admin-list-page-header';

export function NaviresPageContent() {
  const t = useTranslations('pages.produits.croisieres.navires');
  useSetAdminPageMeta({ title: t('title') });

  return (
    <div className="min-w-0">
      <div className="mb-4">
        <AdminPageBackLink href="/produits/croisieres" label={t('backLabel')} />
      </div>
      <AdminListPageHeader routePath="produits/croisieres/navires" />
      <CruisesStatCards className="mb-6" />
      <ShipsList />
    </div>
  );
}
