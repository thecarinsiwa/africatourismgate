import type { Metadata } from 'next';
import { PaymentsPromoSubnav } from '../../../../../components/payments/payments-promo-subnav';
import { PromotionForm } from '../../../../../components/promotions/promotion-form';

export const metadata: Metadata = {
  title: 'Nouvelle promotion — Africa Tourism Gate Admin',
};

export default function NouvellePromotionPage() {
  return (
    <div>
      <PaymentsPromoSubnav />
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Nouvelle promotion</h1>
        <p className="mt-2 text-sm text-atg-muted">
          Définissez la campagne, la réduction éventuelle et les dates de validité.
        </p>
      </div>
      <PromotionForm mode="create" />
    </div>
  );
}
