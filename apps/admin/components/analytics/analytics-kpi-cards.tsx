'use client';

import { StatCard, type StatCardChange } from '@africatourismgate/ui';
import type { AnalyticsChange, AnalyticsSummary } from '@africatourismgate/types';
import { useLocale, useTranslations } from 'next-intl';
import { formatKpiChangePercent } from '../../lib/dashboard-kpi-data';
import { formatCount } from '../../lib/format-money';

type SlotStatus = 'loading' | 'error' | 'ready';

function toStatCardChange(
  change: AnalyticsChange | undefined,
  locale: string,
  label: string,
): StatCardChange | undefined {
  if (!change) {
    return undefined;
  }

  return {
    direction: change.direction,
    formattedPercent: formatKpiChangePercent(change, locale),
    label,
  };
}

const visitorsIcon = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
    />
  </svg>
);

const pageViewsIcon = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

export function AnalyticsKpiCards({
  status,
  summary,
  errorMessage,
  className,
}: {
  status: SlotStatus;
  summary: AnalyticsSummary | null;
  errorMessage?: string;
  className?: string;
}) {
  const t = useTranslations('modules.analytics');
  const locale = useLocale();
  const changeLabel = t('kpi.change.vsPreviousPeriod');

  const cards = [
    {
      key: 'visitors',
      label: t('kpi.visitors.label'),
      subtitle: t('kpi.visitors.subtitle'),
      value: summary ? formatCount(summary.visitors) : undefined,
      change: summary?.visitorsChange,
      icon: visitorsIcon,
      iconClass: 'bg-atg-info-light text-atg-info',
    },
    {
      key: 'pageViews',
      label: t('kpi.pageViews.label'),
      subtitle: t('kpi.pageViews.subtitle'),
      value: summary ? formatCount(summary.pageViews) : undefined,
      change: summary?.pageViewsChange,
      icon: pageViewsIcon,
      iconClass: 'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300',
    },
  ] as const;

  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <StatCard
            key={card.key}
            label={card.label}
            subtitle={card.subtitle}
            status={status}
            value={card.value}
            change={toStatCardChange(card.change, locale, changeLabel)}
            errorMessage={status === 'error' ? errorMessage : undefined}
            icon={card.icon}
            iconClassName={card.iconClass}
          />
        ))}
      </div>
    </div>
  );
}
