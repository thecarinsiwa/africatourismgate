import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../../components/admin-page-intro';
import { PaymentsPromoSubnav } from '../../../../components/payments/payments-promo-subnav';
import { PromoCodesList } from '../../../../components/promo-codes/promo-codes-list';

export const metadata: Metadata = {
  title: 'Codes promo — Africa Tourism Gate Admin',
};

export default function PromoCodesPage() {
  return (
    <div>
      <PaymentsPromoSubnav />
      <AdminPageIntro description={"Créez et gérez les codes utilisables dans le checkout (preview web). Validation des\r\n          dates, unicité du code et plafond d’utilisations. Voir aussi les{' '}\r\n          <a href=\"/paiements/promotions\" className=\"font-medium text-primary hover:underline\">\r\n            promotions\r\n          </a>\r\n          . Accès : promo_codes.read / write."} />
      <PromoCodesList />
    </div>
  );
}
