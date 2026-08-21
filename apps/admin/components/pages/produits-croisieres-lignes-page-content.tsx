'use client';

import { useTranslations } from 'next-intl';
import { CruisesStatCards } from '../cruises/cruises-stat-cards';
import { CruiseLinesList } from '../cruises/cruise-lines-list';
import { AdminPageBackLink } from '../admin-page-back-link';
import { useSetAdminPageMeta } from '../admin-page-meta-context';
import { AdminListPageHeader } from './admin-list-page-header';

export function LignesCroisierePageContent() {
  const t = useTranslations('pages.produits.croisieres.lignes');
  useSetAdminPageMeta({ title: t('title') });

  return (
    <div className="min-w-0">
      <div className="mb-4">
        <AdminPageBackLink href="/produits/croisieres" label={t('backLabel')} />
      </div>
      <AdminListPageHeader routePath="produits/croisieres/lignes" />
      <CruisesStatCards className="mb-6" />
      <CruiseLinesList />
    </div>
  );
}
