'use client';

import { Button } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { PermissionGate } from '../permission-gate';
import { FundEntriesList } from '../treasury/fund-entries-list';
import { AdminListPageHeader } from './admin-list-page-header';

export function TresorerieEntreesPageContent() {
  const t = useTranslations('modules.treasury.entries.list');

  return (
    <div className="min-w-0">
      <AdminListPageHeader
        routePath="tresorerie/entrees"
        actions={
          <PermissionGate permission="treasury.entries.write">
            <Button href="/tresorerie/entrees/nouveau" variant="primary">
              {t('newButton')}
            </Button>
          </PermissionGate>
        }
      />
      <FundEntriesList />
    </div>
  );
}
