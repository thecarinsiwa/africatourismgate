'use client';

import { AccountingBooksSubnav } from '../treasury/accounting-books-subnav';
import { GeneralLedgerList } from '../treasury/general-ledger-list';
import { AdminListPageHeader } from './admin-list-page-header';

type Props = {
  initialAccountId?: string;
};

export function TresorerieComptabiliteGrandLivrePageContent({
  initialAccountId,
}: Props) {
  return (
    <div className="min-w-0 space-y-6">
      <AccountingBooksSubnav />
      <AdminListPageHeader routePath="tresorerie/comptabilite/grand-livre" />
      <GeneralLedgerList initialAccountId={initialAccountId} />
    </div>
  );
}
