'use client';

import { Button } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { PermissionGate } from '../permission-gate';
import { BudgetsList } from '../treasury/budgets-list';
import { AdminListPageHeader } from './admin-list-page-header';

export function TresorerieBudgetsPageContent() {
  const t = useTranslations('modules.treasury.budgets.list');
  const tVs = useTranslations('modules.treasury.budgets.vsActual');

  return (
    <div className="min-w-0">
      <AdminListPageHeader
        routePath="tresorerie/budgets"
        actions={
          <div className="flex flex-wrap gap-2">
            <PermissionGate permission="treasury.read">
              <Button href="/tresorerie/budgets/suivi" variant="outline">
                {tVs('openSuivi')}
              </Button>
            </PermissionGate>
            <PermissionGate permission="treasury.budgets.write">
              <Button href="/tresorerie/budgets/nouveau" variant="primary">
                {t('newButton')}
              </Button>
            </PermissionGate>
          </div>
        }
      />
      <BudgetsList />
    </div>
  );
}
