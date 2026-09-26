'use client';

import { Button } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { PermissionGate } from '../permission-gate';
import { BudgetsList } from '../treasury/budgets-list';
import { AdminListPageHeader } from './admin-list-page-header';

export function TresorerieBudgetsPageContent() {
  const t = useTranslations('modules.treasury.budgets.list');

  return (
    <div className="min-w-0">
      <AdminListPageHeader
        routePath="tresorerie/budgets"
        actions={
          <PermissionGate permission="treasury.budgets.write">
            <Button href="/tresorerie/budgets/nouveau" variant="primary">
              {t('newButton')}
            </Button>
          </PermissionGate>
        }
      />
      <BudgetsList />
    </div>
  );
}
