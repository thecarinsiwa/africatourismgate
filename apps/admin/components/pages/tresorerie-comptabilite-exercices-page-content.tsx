'use client';

import { AccountingBooksSubnav } from '../treasury/accounting-books-subnav';
import { AccountingExercisesList } from '../treasury/accounting-exercises-list';
import { AdminListPageHeader } from './admin-list-page-header';

export function TresorerieComptabiliteExercicesPageContent() {
  return (
    <div className="min-w-0 space-y-6">
      <AccountingBooksSubnav />
      <AdminListPageHeader routePath="tresorerie/comptabilite/exercices" />
      <AccountingExercisesList />
    </div>
  );
}
