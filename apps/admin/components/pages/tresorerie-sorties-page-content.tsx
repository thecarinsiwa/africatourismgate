'use client';

import { Button } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { PermissionGate } from '../permission-gate';
import { FundExitsList } from '../treasury/fund-exits-list';
import { AdminListPageHeader } from './admin-list-page-header';

export function TresorerieSortiesPageContent() {
  const t = useTranslations('modules.treasury.exits.list');

  return (
    <div className="min-w-0">
      <AdminListPageHeader
        routePath="tresorerie/sorties"
        actions={
          <PermissionGate permission="treasury.exits.write">
            <Button href="/tresorerie/sorties/nouveau" variant="primary">
              {t('newButton')}
            </Button>
          </PermissionGate>
        }
      />
      <FundExitsList />
    </div>
  );
}
