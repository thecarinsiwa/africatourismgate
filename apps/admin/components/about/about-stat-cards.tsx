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

export type AboutStatSection =
  | 'pages'
  | 'resources'
  | 'team'
  | 'timeline'
  | 'whyUs'
  | 'happyCustomers';

type AboutStatCardsProps = {
  className?: string;
  section: AboutStatSection;
  locale?: string;
};

type ListQuery = {
  page: number;
  limit: number;
  status?: 'draft' | 'published';
  locale?: string;
};

async function countForSection(
  section: AboutStatSection,
  query: ListQuery,
): Promise<number> {
  const client = getApiClient();

  switch (section) {
    case 'pages':
      return (await client.listAboutPages(query)).meta.total;
    case 'resources':
      return (await client.listAboutResources(query)).meta.total;
    case 'team':
      return (await client.listTeamMembers(query)).meta.total;
    case 'timeline':
      return (await client.listAboutTimelineMilestones(query)).meta.total;
    case 'whyUs':
      return (await client.listWhyUsItems(query)).meta.total;
    case 'happyCustomers':
      return (await client.listHappyCustomersStats(query)).meta.total;
  }
}

export function AboutStatCards({ className, section, locale }: AboutStatCardsProps) {
  const { dashboardKpi: getDashboardKpiErrorMessage } = useAdminErrorMessages();
  const { canLoad, loading: permissionsLoading, shouldRender } = useModuleStatCards('content.read');
  const t = useTranslations(`modules.about.stats.${section}`);
  const [cards, setCards] = useState<Record<ContentStatKpiKey, KpiCardState>>(() => ({
    total: { ...initialCardState },
    published: { ...initialCardState },
    draft: { ...initialCardState },
    french: { ...initialCardState },
  }));

  useEffect(() => {
    if (permissionsLoading || !canLoad) return;

    let cancelled = false;
    const scopedLocale = locale ? { locale } : {};

    async function loadKpi(key: ContentStatKpiKey): Promise<KpiCardState> {
      try {
        if (key === 'total') {
          const total = await countForSection(section, { page: 1, limit: 1, ...scopedLocale });
          return { status: 'ready', displayValue: formatCount(total) };
        }
        if (key === 'published') {
          const total = await countForSection(section, {
            page: 1,
            limit: 1,
            status: 'published',
            ...scopedLocale,
          });
          return { status: 'ready', displayValue: formatCount(total) };
        }
        if (key === 'draft') {
          const total = await countForSection(section, {
            page: 1,
            limit: 1,
            status: 'draft',
            ...scopedLocale,
          });
          return { status: 'ready', displayValue: formatCount(total) };
        }
        const total = await countForSection(section, { page: 1, limit: 1, locale: 'fr' });
        return { status: 'ready', displayValue: formatCount(total) };
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
  }, [canLoad, getDashboardKpiErrorMessage, locale, permissionsLoading, section]);

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
