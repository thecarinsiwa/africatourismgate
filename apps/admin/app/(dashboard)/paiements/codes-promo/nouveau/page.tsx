import type { Metadata } from 'next';
import { PaymentsPromoSubnav } from '../../../../../components/payments/payments-promo-subnav';
import { PromoCodeForm } from '../../../../../components/promo-codes/promo-code-form';

export const metadata: Metadata = {
  title: 'Nouveau code promo — Africa Tourism Gate Admin',
};

export default function NouveauPromoCodePage() {
  return (
    <div>
      <PaymentsPromoSubnav />
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Nouveau code promo</h1>
        <p className="mt-2 text-sm text-atg-muted">
          Le code sera normalisé en majuscules et pourra être saisi tel quel dans le checkout.
        </p>
      </div>
      <PromoCodeForm mode="create" />
    </div>
  );
}
