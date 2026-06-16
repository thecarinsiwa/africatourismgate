'use client';

import { TextLink } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { PaymentsPromoSubnav } from '../payments/payments-promo-subnav';
import { PromotionsList } from '../promotions/promotions-list';
import { AdminPageIntro } from '../admin-page-intro';

export function PromotionsPageContent() {
  const t = useTranslations('pages.paiements.promotions');
  return (
    <div>
      <PaymentsPromoSubnav />
      <AdminPageIntro>
        <p>
          {t('intro')}{' '}
          <TextLink href="/paiements/codes-promo" variant="primary" className="font-medium">
            {t('linkPromoCodes')}
          </TextLink>
          .
        </p>
      </AdminPageIntro>
      <PromotionsList />
    </div>
  );
}
