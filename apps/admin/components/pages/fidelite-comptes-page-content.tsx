'use client';

import { LoyaltyAccountsList } from '../loyalty/loyalty-accounts-list';
import { LoyaltySummaryCards } from '../loyalty/loyalty-summary-cards';
import { AdminIntroPage } from './admin-intro-page';

export function ComptesFidelitePageContent() {
  return (
    <AdminIntroPage routePath="fidelite/comptes">
      <LoyaltySummaryCards className="mb-6" />
      <LoyaltyAccountsList />
    </AdminIntroPage>
  );
}
