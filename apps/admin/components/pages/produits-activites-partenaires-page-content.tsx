'use client';

import { Button } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { ActivityProvidersList } from '../activities/activity-providers-list';
import { ActivitiesStatCards } from '../activities/activities-stat-cards';
import { AdminListPageHeader } from './admin-list-page-header';

export function PartenairesActivitesPageContent() {
  const tNav = useTranslations('nav.links');
  return (
    <div className="min-w-0">
      <AdminListPageHeader
        routePath="produits/activites/partenaires"
        actions={
          <Button href="/produits/activites" variant="outline">
            {tNav('activities')}
          </Button>
        }
      />
      <ActivitiesStatCards className="mb-6" />
      <ActivityProvidersList />
    </div>
  );
}
