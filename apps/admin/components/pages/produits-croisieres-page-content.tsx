'use client';

import { Button } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { CruisesStatCards } from '../cruises/cruises-stat-cards';
import { SailingsList } from '../cruises/sailings-list';
import { AdminListPageHeader } from './admin-list-page-header';

export function CroisieresPageContent() {
  const t = useTranslations('pages.produits.croisieres');

  return (
    <div className="min-w-0 overflow-x-hidden">
      <AdminListPageHeader
        routePath="produits/croisieres"
        actions={
          <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
            <Button href="/produits/croisieres/lignes" variant="outline" className="min-w-0 flex-1 sm:flex-none">
              {t('actions.lines')}
            </Button>
            <Button href="/produits/croisieres/ports" variant="outline" className="min-w-0 flex-1 sm:flex-none">
              {t('actions.ports')}
            </Button>
            <Button href="/produits/croisieres/navires" variant="outline" className="min-w-0 flex-1 sm:flex-none">
              {t('actions.ships')}
            </Button>
            <Button href="/produits/croisieres/nouveau" className="min-w-0 flex-1 sm:flex-none">
              {t('actions.new')}
            </Button>
          </div>
        }
      />
      <CruisesStatCards className="mb-6" />
      <SailingsList />
    </div>
  );
}
