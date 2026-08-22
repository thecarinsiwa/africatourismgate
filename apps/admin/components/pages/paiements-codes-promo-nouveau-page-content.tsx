'use client';

import { PaymentsPromoSubnav } from '../payments/payments-promo-subnav';
import { PromoCodeForm } from '../promo-codes/promo-code-form';
import { AdminIntroPage } from './admin-intro-page';

export function NouveauCodePromoPageContent() {
  return (
    <div className="min-w-0">
      <PaymentsPromoSubnav />
      <AdminIntroPage
        routePath="paiements/codes-promo/nouveau"
        backHref="/paiements/codes-promo"
        backLabelKey="backLabel"
      >
        <PromoCodeForm mode="create" />
      </AdminIntroPage>
    </div>
  );
}
