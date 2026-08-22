'use client';

import { Button } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { PromoCodesListFilter } from '../../config/promo-codes-kpi';
import { getApiClient } from '../../lib/auth/api';
import { PaymentsPromoSubnav } from '../payments/payments-promo-subnav';
import { PromoCodesList } from '../promo-codes/promo-codes-list';
import { PromoCodesStatCards } from '../promo-codes/promo-codes-stat-cards';
import { AdminListPageHeader } from './admin-list-page-header';

export function CodesPromoPageContent() {
  const t = useTranslations('pages.paiements.codes-promo');
  const [canWrite, setCanWrite] = useState(false);
  const [listFilter, setListFilter] = useState<PromoCodesListFilter>({});
  const listRef = useRef<HTMLDivElement>(null);

  const handleListFilterChange = useCallback((filter: PromoCodesListFilter) => {
    setListFilter(filter);
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, []);

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
      <PromoCodesStatCards
        className="mb-6"
        listFilter={listFilter}
        onListFilterChange={handleListFilterChange}
      />
      <div ref={listRef}>
        <PromoCodesList listFilter={listFilter} />
      </div>
    </div>
  );
}
