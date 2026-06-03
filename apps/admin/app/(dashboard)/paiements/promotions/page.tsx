import type { Metadata } from 'next';
import { PaymentsPromoSubnav } from '../../../../components/payments/payments-promo-subnav';
import { PromotionsList } from '../../../../components/promotions/promotions-list';

export const metadata: Metadata = {
  title: 'Promotions — Africa Tourism Gate Admin',
};

export default function PromotionsPage() {
  return (
    <div>
      <PaymentsPromoSubnav />
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Promotions</h1>
        <p className="mt-2 text-sm text-atg-muted">
          Campagnes marketing avec réduction optionnelle (checkout via{' '}
          <code className="text-xs">promotionId</code>). Complémentaire aux{' '}
          <a href="/paiements/codes-promo" className="font-medium text-primary hover:underline">
            codes promo
          </a>
          . Accès : promo_codes.read / write.
        </p>
      </div>
      <PromotionsList />
    </div>
  );
}
