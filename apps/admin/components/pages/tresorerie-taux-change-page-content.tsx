'use client';

import { ExchangeRatesList } from '../treasury/exchange-rates-list';
import { AdminListPageHeader } from './admin-list-page-header';

export function TresorerieTauxChangePageContent() {
  return (
    <div className="min-w-0 space-y-6">
      <AdminListPageHeader routePath="tresorerie/taux-change" />
      <ExchangeRatesList />
    </div>
  );
}
