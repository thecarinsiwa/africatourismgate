'use client';

import { Button } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { PaymentsPromoSubnav } from '../payments/payments-promo-subnav';
import { PromoCodesList } from '../promo-codes/promo-codes-list';
import { AdminListPageHeader } from './admin-list-page-header';

export function CodesPromoPageContent() {
  const t = useTranslations('pages.paiements.codes-promo');
  const [canWrite, setCanWrite] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const me = await getApiClient().getAuthMe();
        if (!cancelled) {
          setCanWrite(me.isSuperAdmin || me.permissions.includes('promo_codes.write'));
        }
      } catch {
        if (!cancelled) setCanWrite(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-w-0">
      <PaymentsPromoSubnav />
      <AdminListPageHeader
        routePath="paiements/codes-promo"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button href="/paiements/promotions" variant="outline">
              {t('actions.promotions')}
            </Button>
            {canWrite ? (
              <Button href="/paiements/codes-promo/nouveau" variant="primary">
                {t('actions.new')}
              </Button>
            ) : null}
          </div>
        }
      />
      <PromoCodesList />
    </div>
  );
}
