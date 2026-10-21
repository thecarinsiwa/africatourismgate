'use client';

import { AccountingBooksSubnav } from '../treasury/accounting-books-subnav';
import { AccountingClosingPanel } from '../treasury/accounting-closing-panel';
import { AdminListPageHeader } from './admin-list-page-header';

export function TresorerieComptabiliteCloturePageContent() {
  return (
    <div className="min-w-0 space-y-6">
      <AccountingBooksSubnav />
      <AdminListPageHeader routePath="tresorerie/comptabilite/cloture" />
      <AccountingClosingPanel />
    </div>
  );
}
