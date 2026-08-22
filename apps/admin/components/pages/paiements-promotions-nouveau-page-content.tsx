'use client';

import { PaymentsPromoSubnav } from '../payments/payments-promo-subnav';
import { PromotionForm } from '../promotions/promotion-form';
import { AdminIntroPage } from './admin-intro-page';

export function NouvellePromotionPageContent() {
  return (
    <div className="min-w-0">
      <PaymentsPromoSubnav />
      <AdminIntroPage
        routePath="paiements/promotions/nouveau"
        backHref="/paiements/promotions"
        backLabelKey="backLabel"
      >
        <PromotionForm mode="create" />
      </AdminIntroPage>
    </div>
  );
}
