'use client';

import { AccountingBooksSubnav } from '../treasury/accounting-books-subnav';
import { AccountingFinancialStatementPanel } from '../treasury/accounting-financial-statement-panel';
import { AdminListPageHeader } from './admin-list-page-header';

export function TresorerieComptabiliteCompteResultatPageContent() {
  return (
    <div className="min-w-0 space-y-6">
      <AccountingBooksSubnav />
      <AdminListPageHeader routePath="tresorerie/comptabilite/compte-resultat" />
      <AccountingFinancialStatementPanel kind="income_statement" />
    </div>
  );
}
