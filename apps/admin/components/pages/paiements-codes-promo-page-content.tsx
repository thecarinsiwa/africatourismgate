'use client';

import { TextLink } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { PaymentsPromoSubnav } from '../payments/payments-promo-subnav';
import { PromoCodesList } from '../promo-codes/promo-codes-list';
import { AdminPageIntro } from '../admin-page-intro';

export function CodesPromoPageContent() {
  const t = useTranslations('pages.paiements.codes-promo');
  return (
    <div>
      <PaymentsPromoSubnav />
      <AdminPageIntro>
        <p>
          {t('intro')}{' '}
          <TextLink href="/paiements/promotions" variant="primary" className="font-medium">
            {t('linkPromotions')}
          </TextLink>
          .
        </p>
      </AdminPageIntro>
      <PromoCodesList />
    </div>
  );
}
