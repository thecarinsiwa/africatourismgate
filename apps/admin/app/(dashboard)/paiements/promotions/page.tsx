import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../../components/admin-page-intro';
import { PaymentsPromoSubnav } from '../../../../components/payments/payments-promo-subnav';
import { PromotionsList } from '../../../../components/promotions/promotions-list';

export const metadata: Metadata = {
  title: 'Promotions — Africa Tourism Gate Admin',
};

export default function PromotionsPage() {
  return (
    <div>
      <PaymentsPromoSubnav />
      <AdminPageIntro description={"Campagnes marketing avec réduction optionnelle (checkout via{' '}\r\n          <code className=\"text-xs\">promotionId</code>). Complémentaire aux{' '}\r\n          <a href=\"/paiements/codes-promo\" className=\"font-medium text-primary hover:underline\">\r\n            codes promo\r\n          </a>\r\n          . Accès : promo_codes.read / write."} />
      <PromotionsList />
    </div>
  );
}
