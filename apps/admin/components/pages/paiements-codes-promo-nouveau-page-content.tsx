'use client';

import { useSearchParams } from 'next/navigation';
import { PaymentsPromoSubnav } from '../payments/payments-promo-subnav';
import { PromoCodeForm } from '../promo-codes/promo-code-form';
import { AdminIntroPage } from './admin-intro-page';

export function NouveauCodePromoPageContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get('code') ?? undefined;

  return (
    <div className="min-w-0">
      <PaymentsPromoSubnav />
      <AdminIntroPage
        routePath="paiements/codes-promo/nouveau"
        backHref="/paiements/codes-promo"
        backLabelKey="backLabel"
      >
        <PromoCodeForm mode="create" initialCode={initialCode} />
      </AdminIntroPage>
    </div>
  );
}
