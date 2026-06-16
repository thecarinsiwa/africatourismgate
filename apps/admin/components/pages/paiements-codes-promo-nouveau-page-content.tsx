'use client';

import { PromoCodeForm } from '../promo-codes/promo-code-form';
import { AdminIntroPage } from './admin-intro-page';

export function NouveauCodePromoPageContent() {
  return (
    <AdminIntroPage routePath="paiements/codes-promo/nouveau">
      <PromoCodeForm mode="create" />
    </AdminIntroPage>
  );
}
