'use client';

import { PaymentsList } from '../payments/payments-list';
import { PaymentsStatCards } from '../payments/payments-stat-cards';
import { AdminIntroPage } from './admin-intro-page';

export function PaiementsPageContent() {
  return (
    <AdminIntroPage routePath="paiements">
      <PaymentsStatCards className="mb-6" />
      <PaymentsList />
    </AdminIntroPage>
  );
}
