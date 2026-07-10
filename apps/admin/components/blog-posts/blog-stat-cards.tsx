'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { StatCard } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { blogKpis, type BlogKpiKey } from '../../config/blog-kpi';
import { useModuleStatCards } from '../../lib/auth/use-module-stat-cards';
import { getApiClient } from '../../lib/auth/api';
import { formatCount } from '../../lib/format-money';

type KpiCardState = {
  status: 'loading' | 'ready' | 'error';
  displayValue?: string;
  errorMessage?: string;
};

const initialCardState: KpiCardState = { status: 'loading' };

export function BlogStatCards({ className }: { className?: string }) {
  const { dashboardKpi: getDashboardKpiErrorMessage } = useAdminErrorMessages();
  const { canLoad, loading: permissionsLoading, shouldRender } = useModuleStatCards('blog.read');
  const t = useTranslations('modules.blog');
  const [cards, setCards] = useState<Record<BlogKpiKey, KpiCardState>>(() => ({
    total: { ...initialCardState },
    published: { ...initialCardState },
    draft: { ...initialCardState },
    french: { ...initialCardState },
  }));

  useEffect(() => {
    if (permissionsLoading || !canLoad) return;

    let cancelled = false;
    const client = getApiClient();

    async function loadKpi(key: BlogKpiKey): Promise<KpiCardState> {
      try {
        if (key === 'total') {
          const result = await client.listBlogPosts({ page: 1, limit: 1 });
          return { status: 'ready', displayValue: formatCount(result.meta.total) };
        }
        if (key === 'published') {
          const result = await client.listBlogPosts({ page: 1, limit: 1, status: 'published' });
          return { status: 'ready', displayValue: formatCount(result.meta.total) };
        }
        if (key === 'draft') {
          const result = await client.listBlogPosts({ page: 1, limit: 1, status: 'draft' });
          return { status: 'ready', displayValue: formatCount(result.meta.total) };
        }
        const result = await client.listBlogPosts({ page: 1, limit: 1, locale: 'fr' });
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
        blogKpis.map(async (kpi) => [kpi.key, await loadKpi(kpi.key)] as const),
      );

      if (cancelled) return;

      setCards(Object.fromEntries(results) as Record<BlogKpiKey, KpiCardState>);
    }

    void loadAll();

    return () => {
      cancelled = true;
    };
  }, [canLoad, getDashboardKpiErrorMessage, permissionsLoading]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {blogKpis.map((kpi) => {
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
