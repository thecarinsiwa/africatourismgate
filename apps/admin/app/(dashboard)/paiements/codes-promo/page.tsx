import type { Metadata } from 'next';
import { PaymentsPromoSubnav } from '../../../../components/payments/payments-promo-subnav';
import { PromoCodesList } from '../../../../components/promo-codes/promo-codes-list';

export const metadata: Metadata = {
  title: 'Codes promo — Africa Tourism Gate Admin',
};

export default function PromoCodesPage() {
  return (
    <div>
      <PaymentsPromoSubnav />
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Codes promo</h1>
        <p className="mt-2 text-sm text-atg-muted">
          Créez et gérez les codes utilisables dans le checkout (preview web). Validation des
          dates, unicité du code et plafond d’utilisations. Voir aussi les{' '}
          <a href="/paiements/promotions" className="font-medium text-primary hover:underline">
            promotions
          </a>
          . Accès : promo_codes.read / write.
        </p>
      </div>
      <PromoCodesList />
    </div>
  );
}
