'use client';

import { CurrenciesList } from '../system/currencies-list';
import { AdminListPageHeader } from './admin-list-page-header';

export function SystemeDevisesPageContent() {
  return (
    <div className="min-w-0 space-y-6">
      <AdminListPageHeader routePath="systeme/devises" />
      <CurrenciesList />
    </div>
  );
}
