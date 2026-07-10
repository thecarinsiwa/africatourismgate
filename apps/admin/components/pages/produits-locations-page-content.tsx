'use client';

import { Button } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { LocationsStatCards } from '../locations/locations-stat-cards';
import { VehiclesList } from '../locations/vehicles-list';
import { AdminListPageHeader } from './admin-list-page-header';

export function LocationsPageContent() {
  const t = useTranslations('pages.produits.locations');

  return (
    <div className="min-w-0">
      <AdminListPageHeader
        routePath="produits/locations"
        actions={
          <>
            <Button href="/produits/locations/agences" variant="outline">
              {t('actions.agencies')}
            </Button>
            <Button href="/produits/locations/categories" variant="outline">
              {t('actions.categories')}
            </Button>
            <Button href="/produits/locations/nouveau">{t('actions.new')}</Button>
          </>
        }
      />
      <LocationsStatCards className="mb-6" />
      <VehiclesList />
    </div>
  );
}
