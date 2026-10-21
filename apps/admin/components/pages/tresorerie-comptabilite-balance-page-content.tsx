'use client';

import { AccountingBalancePanel } from '../treasury/accounting-balance-panel';
import { AccountingBooksSubnav } from '../treasury/accounting-books-subnav';
import { AdminListPageHeader } from './admin-list-page-header';

export function TresorerieComptabiliteBalancePageContent() {
  return (
    <div className="min-w-0 space-y-6">
      <AccountingBooksSubnav />
      <AdminListPageHeader routePath="tresorerie/comptabilite/balance" />
      <AccountingBalancePanel />
    </div>
  );
}
