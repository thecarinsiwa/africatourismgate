'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { StatCard } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { contentStatKpis, type ContentStatKpiKey } from '../../config/content-stat-kpis';
import { useModuleStatCards } from '../../lib/auth/use-module-stat-cards';
import { getApiClient } from '../../lib/auth/api';
import { formatCount } from '../../lib/format-money';

type KpiCardState = {
  status: 'loading' | 'ready' | 'error';
  displayValue?: string;
  errorMessage?: string;
};

const initialCardState: KpiCardState = { status: 'loading' };

type HeroSlidesStatCardsProps = {
  className?: string;
  locale?: string;
};

export function HeroSlidesStatCards({ className, locale }: HeroSlidesStatCardsProps) {
  const { dashboardKpi: getDashboardKpiErrorMessage } = useAdminErrorMessages();
  const { canLoad, loading: permissionsLoading, shouldRender } = useModuleStatCards('content.read');
  const t = useTranslations('modules.heroSlides.stats');
  const [cards, setCards] = useState<Record<ContentStatKpiKey, KpiCardState>>(() => ({
    total: { ...initialCardState },
    published: { ...initialCardState },
    draft: { ...initialCardState },
    french: { ...initialCardState },
  }));

  useEffect(() => {
    if (permissionsLoading || !canLoad) return;

    let cancelled = false;
    const client = getApiClient();
    const localeFilter = locale ? { locale } : {};

    async function loadKpi(key: ContentStatKpiKey): Promise<KpiCardState> {
      try {
        if (key === 'total') {
          const result = await client.listHeroSlides({ page: 1, limit: 1, ...localeFilter });
          return { status: 'ready', displayValue: formatCount(result.meta.total) };
        }
        if (key === 'published') {
          const result = await client.listHeroSlides({
            page: 1,
            limit: 1,
            status: 'published',
            ...localeFilter,
          });
          return { status: 'ready', displayValue: formatCount(result.meta.total) };
        }
        if (key === 'draft') {
          const result = await client.listHeroSlides({
            page: 1,
            limit: 1,
            status: 'draft',
            ...localeFilter,
          });
          return { status: 'ready', displayValue: formatCount(result.meta.total) };
        }
        const result = await client.listHeroSlides({ page: 1, limit: 1, locale: 'fr' });
        return { status: 'ready', displayValue: formatCount(result.meta.total) };
      } catch (error) {
        return {
          status: 'error',
          errorMessage: getDashboardKpiErrorMessage(error),
        };
      }
    }

    async function loadAll() {
      const results = await Promise.all(
        contentStatKpis.map(async (kpi) => [kpi.key, await loadKpi(kpi.key)] as const),
      );

      if (cancelled) return;

      setCards(Object.fromEntries(results) as Record<ContentStatKpiKey, KpiCardState>);
    }

    void loadAll();

    return () => {
      cancelled = true;
    };
  }, [canLoad, getDashboardKpiErrorMessage, locale, permissionsLoading]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {contentStatKpis.map((kpi) => {
          const state = cards[kpi.key];
          return (
            <div key={kpi.key}>
              <StatCard
                label={t(kpi.labelKey)}
                subtitle={t(kpi.subtitleKey)}
                status={state.status}
                value={state.displayValue}
                errorMessage={state.errorMessage}
                icon={kpi.icon}
                iconClassName={kpi.iconClass}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
