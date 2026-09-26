'use client';

import { AccountingBooksSubnav } from '../treasury/accounting-books-subnav';
import { JournalEntriesList } from '../treasury/journal-entries-list';
import { AdminListPageHeader } from './admin-list-page-header';

export function TresorerieComptabiliteJournalPageContent() {
  return (
    <div className="min-w-0 space-y-6">
      <AccountingBooksSubnav />
      <AdminListPageHeader routePath="tresorerie/comptabilite/journal" />
      <JournalEntriesList />
    </div>
  );
}
