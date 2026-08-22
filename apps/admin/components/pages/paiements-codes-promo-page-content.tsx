'use client';

import { PaymentsPromoSubnav } from '../payments/payments-promo-subnav';
import { PromoCodesList } from '../promo-codes/promo-codes-list';
import { AdminListPageHeader } from './admin-list-page-header';

export function CodesPromoPageContent() {
  return (
    <div className="min-w-0">
      <PaymentsPromoSubnav />
      <AdminListPageHeader routePath="paiements/codes-promo" />
      <PromoCodesList />
    </div>
  );
}
