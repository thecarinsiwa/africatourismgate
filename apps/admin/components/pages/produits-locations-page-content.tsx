'use client';

import { TextLink } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { LocationsStatCards } from '../locations/locations-stat-cards';
import { VehiclesList } from '../locations/vehicles-list';
import { AdminListPageHeader } from './admin-list-page-header';

export function LocationsPageContent() {
  const t = useTranslations('pages.produits.locations');
  return (
    <div>
      <AdminListPageHeader routePath="produits/locations" />
      <p className="-mt-4 mb-6 text-sm text-atg-muted">
        <TextLink href="/produits/locations/agences" variant="primary" className="font-medium">
          {t('links.agencies')}
        </TextLink>
        <span className="mx-2">·</span>
        <TextLink href="/produits/locations/categories" variant="primary" className="font-medium">
          {t('links.categories')}
        </TextLink>
      </p>
      <LocationsStatCards className="mb-6" />
      <VehiclesList />
    </div>
  );
}
