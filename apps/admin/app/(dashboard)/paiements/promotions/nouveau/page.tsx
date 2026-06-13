import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../../../components/admin-page-intro';
import { PaymentsPromoSubnav } from '../../../../../components/payments/payments-promo-subnav';
import { PromotionForm } from '../../../../../components/promotions/promotion-form';

export const metadata: Metadata = {
  title: 'Nouvelle promotion — Africa Tourism Gate Admin',
};

export default function NouvellePromotionPage() {
  return (
    <div>
      <PaymentsPromoSubnav />
      <AdminPageIntro description={"Définissez la campagne, la réduction éventuelle et les dates de validité."} />
      <PromotionForm mode="create" />
    </div>
  );
}
