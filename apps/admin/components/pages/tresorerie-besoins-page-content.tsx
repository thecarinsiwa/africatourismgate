'use client';

import { Button } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { PermissionGate } from '../permission-gate';
import { ExpenseRequestsList } from '../treasury/expense-requests-list';
import { AdminListPageHeader } from './admin-list-page-header';

export function TresorerieBesoinsPageContent() {
  const t = useTranslations('modules.treasury.expenseRequests.list');

  return (
    <div className="min-w-0">
      <AdminListPageHeader
        routePath="tresorerie/besoins"
        actions={
          <PermissionGate permission="treasury.expense_requests.create">
            <Button href="/tresorerie/besoins/nouveau" variant="primary">
              {t('newButton')}
            </Button>
          </PermissionGate>
        }
      />
      <ExpenseRequestsList />
    </div>
  );
}
