import type { Metadata } from 'next';
import { TextLink } from '@africatourismgate/ui';
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
      <AdminPageIntro>
        <p>
          Campagnes marketing avec réduction optionnelle (checkout via{' '}
          <code className="text-xs">promotionId</code>). Complémentaire aux{' '}
          <TextLink href="/paiements/codes-promo" variant="primary" className="font-medium">
            codes promo
          </TextLink>
          . Accès : promo_codes.read / write.
        </p>
      </AdminPageIntro>
      <PromotionsList />
    </div>
  );
}
