'use client';

import { useTranslations } from 'next-intl';
import { CruisesStatCards } from '../cruises/cruises-stat-cards';
import { CruisePortsList } from '../cruises/cruise-ports-list';
import { AdminPageBackLink } from '../admin-page-back-link';
import { useSetAdminPageMeta } from '../admin-page-meta-context';
import { AdminListPageHeader } from './admin-list-page-header';

export function PortsCroisierePageContent() {
  const t = useTranslations('pages.produits.croisieres.ports');
  useSetAdminPageMeta({ title: t('title') });

  return (
    <div className="min-w-0">
      <div className="mb-4">
        <AdminPageBackLink href="/produits/croisieres" label={t('backLabel')} />
      </div>
      <AdminListPageHeader routePath="produits/croisieres/ports" />
      <CruisesStatCards className="mb-6" />
      <CruisePortsList />
    </div>
  );
}
