'use client';

import { Button } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { PaymentsList } from '../payments/payments-list';
import { PaymentsPromoSubnav } from '../payments/payments-promo-subnav';
import { PaymentsStatCards } from '../payments/payments-stat-cards';
import { AdminListPageHeader } from './admin-list-page-header';

export function PaiementsPageContent() {
  const t = useTranslations('pages.paiements');

  return (
    <div className="min-w-0">
      <PaymentsPromoSubnav />
      <AdminListPageHeader
        routePath="paiements"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button href="/paiements/codes-promo" variant="outline">
              {t('actions.promoCodes')}
            </Button>
            <Button href="/paiements/promotions" variant="outline">
              {t('actions.promotions')}
            </Button>
          </div>
        }
      />
      <PaymentsStatCards className="mb-6" />
      <PaymentsList />
    </div>
  );
}
