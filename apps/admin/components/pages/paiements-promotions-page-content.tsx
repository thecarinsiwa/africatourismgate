'use client';

import { Button } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { PromotionsListFilter } from '../../config/promotions-kpi';
import { getApiClient } from '../../lib/auth/api';
import { PaymentsPromoSubnav } from '../payments/payments-promo-subnav';
import { PromotionsList } from '../promotions/promotions-list';
import { PromotionsStatCards } from '../promotions/promotions-stat-cards';
import { AdminListPageHeader } from './admin-list-page-header';

export function PromotionsPageContent() {
  const t = useTranslations('pages.paiements.promotions');
  const [canWrite, setCanWrite] = useState(false);
  const [listFilter, setListFilter] = useState<PromotionsListFilter>({});
  const listRef = useRef<HTMLDivElement>(null);

  const handleListFilterChange = useCallback((filter: PromotionsListFilter) => {
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
        routePath="paiements/promotions"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button href="/paiements/codes-promo" variant="outline">
              {t('actions.promoCodes')}
            </Button>
            {canWrite ? (
              <Button href="/paiements/promotions/nouveau" variant="primary">
                {t('actions.new')}
              </Button>
            ) : null}
          </div>
        }
      />
      <PromotionsStatCards
        className="mb-6"
        listFilter={listFilter}
        onListFilterChange={handleListFilterChange}
      />
      <div ref={listRef}>
        <PromotionsList listFilter={listFilter} />
      </div>
    </div>
  );
}
