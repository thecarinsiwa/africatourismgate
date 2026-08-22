'use client';

import { PaymentsPromoSubnav } from '../payments/payments-promo-subnav';
import { PromotionsList } from '../promotions/promotions-list';
import { AdminListPageHeader } from './admin-list-page-header';

export function PromotionsPageContent() {
  return (
    <div className="min-w-0">
      <PaymentsPromoSubnav />
      <AdminListPageHeader routePath="paiements/promotions" />
      <PromotionsList />
    </div>
  );
}
