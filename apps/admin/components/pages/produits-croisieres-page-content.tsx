'use client';

import { Button } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { CruisesStatCards } from '../cruises/cruises-stat-cards';
import { SailingsList } from '../cruises/sailings-list';
import { AdminListPageHeader } from './admin-list-page-header';

export function CroisieresPageContent() {
  const t = useTranslations('pages.produits.croisieres');

  return (
    <div className="min-w-0">
      <AdminListPageHeader
        routePath="produits/croisieres"
        actions={
          <>
            <Button href="/produits/croisieres/lignes" variant="outline">
              {t('actions.lines')}
            </Button>
            <Button href="/produits/croisieres/ports" variant="outline">
              {t('actions.ports')}
            </Button>
            <Button href="/produits/croisieres/navires" variant="outline">
              {t('actions.ships')}
            </Button>
            <Button href="/produits/croisieres/nouveau">{t('actions.new')}</Button>
          </>
        }
      />
      <CruisesStatCards className="mb-6" />
      <SailingsList />
    </div>
  );
}
