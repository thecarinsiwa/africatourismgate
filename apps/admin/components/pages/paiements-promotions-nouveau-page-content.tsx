'use client';

import { PromotionForm } from '../promotions/promotion-form';
import { AdminIntroPage } from './admin-intro-page';

export function NouvellePromotionPageContent() {
  return (
    <AdminIntroPage routePath="paiements/promotions/nouveau">
      <PromotionForm mode="create" />
    </AdminIntroPage>
  );
}
