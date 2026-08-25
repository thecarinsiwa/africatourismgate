'use client';

import { Button } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { PackagesList } from '../packages/packages-list';
import { PackagesStatCards } from '../packages/packages-stat-cards';
import { AdminListPageHeader } from './admin-list-page-header';

export function ForfaitsPageContent() {
  const t = useTranslations('pages.produits.forfaits');
  return (
    <div className="min-w-0">
      <AdminListPageHeader
        routePath="produits/forfaits"
        actions={<Button href="/produits/forfaits/nouveau">{t('actions.new')}</Button>}
      />
      <PackagesStatCards className="mb-6" />
      <PackagesList />
    </div>
  );
}
