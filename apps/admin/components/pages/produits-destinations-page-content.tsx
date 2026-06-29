'use client';

import { Button } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { DestinationsList } from '../destinations/destinations-list';
import { DestinationsStatCards } from '../destinations/destinations-stat-cards';
import { AdminListPageHeader } from './admin-list-page-header';

export function DestinationsPageContent() {
  const t = useTranslations('pages.produits.destinations');
  return (
    <div>
      <AdminListPageHeader
        routePath="produits/destinations"
        actions={
          <Button href="/produits/destinations/nouveau" variant="primary">
            {t('actions.new')}
          </Button>
        }
      />
      <DestinationsStatCards className="mb-6" />
      <DestinationsList />
    </div>
  );
}
