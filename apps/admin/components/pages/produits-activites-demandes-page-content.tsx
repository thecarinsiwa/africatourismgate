'use client';

import { Button } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { ActivityBookingRequestsList } from '../activities/activity-booking-requests-list';
import { AdminListPageHeader } from './admin-list-page-header';

export function ActivitesDemandesPageContent() {
  const t = useTranslations('pages.produits.activites');
  return (
    <div className="min-w-0">
      <AdminListPageHeader
        routePath="produits/activites/demandes"
        actions={
          <Button href="/produits/activites" variant="outline">
            {t('actions.backToList')}
          </Button>
        }
      />
      <ActivityBookingRequestsList />
    </div>
  );
}
