'use client';

import { useTranslations } from 'next-intl';
import { ShipForm } from '../cruises/ship-form';
import { AdminPageBackLink } from '../admin-page-back-link';
import { useSetAdminPageMeta } from '../admin-page-meta-context';
import { AdminListPageHeader } from './admin-list-page-header';

export function NouveauNavirePageContent() {
  const t = useTranslations('pages.produits.croisieres.navires.nouveau');
  useSetAdminPageMeta({ title: t('metaTitle') });

  return (
    <div className="min-w-0">
      <div className="mb-4">
        <AdminPageBackLink
          href="/produits/croisieres/navires"
          label={t('backLabel')}
        />
      </div>
      <AdminListPageHeader
        routePath="produits/croisieres/navires/nouveau"
        titleKey="metaTitle"
      />
      <ShipForm mode="create" />
    </div>
  );
}
