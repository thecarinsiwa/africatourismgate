'use client';

import { Button } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';
import { DestinationsList } from '../destinations/destinations-list';
import { DestinationsStatCards } from '../destinations/destinations-stat-cards';
import { AdminListPageHeader } from './admin-list-page-header';

export function DestinationsPageContent() {
  const t = useTranslations('pages.produits.destinations');
  const [statsKey, setStatsKey] = useState(0);
  const handleChanged = useCallback(() => {
    setStatsKey((value) => value + 1);
  }, []);

  return (
    <div className="min-w-0">
      <AdminListPageHeader
        routePath="produits/destinations"
        actions={
          <Button href="/produits/destinations/nouveau" variant="primary">
            {t('actions.new')}
          </Button>
        }
      />
      <DestinationsStatCards refreshKey={statsKey} className="mb-6" />
      <DestinationsList onChanged={handleChanged} />
    </div>
  );
}
