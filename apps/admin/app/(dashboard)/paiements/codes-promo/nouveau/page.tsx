import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../../../components/admin-page-intro';
import { PaymentsPromoSubnav } from '../../../../../components/payments/payments-promo-subnav';
import { PromoCodeForm } from '../../../../../components/promo-codes/promo-code-form';

export const metadata: Metadata = {
  title: 'Nouveau code promo — Africa Tourism Gate Admin',
};

export default function NouveauPromoCodePage() {
  return (
    <div>
      <PaymentsPromoSubnav />
      <AdminPageIntro description={"Le code sera normalisé en majuscules et pourra être saisi tel quel dans le checkout."} />
      <PromoCodeForm mode="create" />
    </div>
  );
}
