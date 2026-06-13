import type { Metadata } from 'next';
import { TextLink } from '@africatourismgate/ui';
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
      <AdminPageIntro>
        <p>
          Créez et gérez les codes utilisables dans le checkout (preview web). Validation des
          dates, unicité du code et plafond d’utilisations. Voir aussi les{' '}
          <TextLink href="/paiements/promotions" variant="primary" className="font-medium">
            promotions
          </TextLink>
          . Accès : promo_codes.read / write.
        </p>
      </AdminPageIntro>
      <PromoCodesList />
    </div>
  );
}
