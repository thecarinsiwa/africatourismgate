'use client';

import { Button } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { FlightsList } from '../flights/flights-list';
import { FlightsStatCards } from '../flights/flights-stat-cards';
import { AdminListPageHeader } from './admin-list-page-header';

export function VolsPageContent() {
  const t = useTranslations('pages.produits.vols');

  return (
    <div className="min-w-0">
      <AdminListPageHeader
        routePath="produits/vols"
        actions={
          <>
            <Button href="/produits/vols/compagnies" variant="outline">
              {t('actions.airlines')}
            </Button>
            <Button href="/produits/vols/aeroports" variant="outline">
              {t('actions.airports')}
            </Button>
            <Button href="/produits/vols/nouveau">{t('actions.new')}</Button>
          </>
        }
      />
      <FlightsStatCards className="mb-6" />
      <FlightsList />
    </div>
  );
}
