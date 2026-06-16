'use client';

import { LoyaltyAccountsList } from '../loyalty/loyalty-accounts-list';
import { LoyaltySummaryCards } from '../loyalty/loyalty-summary-cards';
import { AdminListPageHeader } from './admin-list-page-header';

export function ComptesFidelitePageContent() {
  return (
    <div>
      <AdminListPageHeader routePath="fidelite/comptes" />
      <LoyaltySummaryCards className="mb-6" />
      <LoyaltyAccountsList />
    </div>
  );
}
