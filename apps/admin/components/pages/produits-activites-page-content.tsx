'use client';

import { Button } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { ActivitiesList } from '../activities/activities-list';
import { ActivitiesStatCards } from '../activities/activities-stat-cards';
import { AdminListPageHeader } from './admin-list-page-header';

export function ActivitesPageContent() {
  const t = useTranslations('pages.produits.activites');
  return (
    <div className="min-w-0">
      <AdminListPageHeader
        routePath="produits/activites"
        actions={
          <>
            <Button href="/produits/activites/fournisseurs" variant="outline">
              {t('actions.providers')}
            </Button>
            <Button href="/produits/activites/nouveau">{t('actions.new')}</Button>
          </>
        }
      />
      <ActivitiesStatCards className="mb-6" />
      <ActivitiesList />
    </div>
  );
}
