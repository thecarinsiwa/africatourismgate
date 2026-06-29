'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { Card, Skeleton, StatCard } from '@africatourismgate/ui';
import type { AdminLoyaltyAccountListItem } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { loyaltyKpis } from '../../config/loyalty-kpi';
import { getApiClient } from '../../lib/auth/api';
import { useFormatCount, useFormatPoints, useLoyaltyTierLabels } from '../../lib/i18n/use-module-labels';

type SummaryState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | {
      status: 'ready';
      totalAccounts: number;
      totalPoints: number;
      topAccount: AdminLoyaltyAccountListItem | null;
    };

export function LoyaltySummaryCards({ className }: { className?: string }) {
  const { dashboardKpi: getDashboardKpiErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.loyalty');
  const tEmpty = useTranslations('modules.common.empty');
  const formatCount = useFormatCount();
  const formatPoints = useFormatPoints();
  const tierLabels = useLoyaltyTierLabels();
  const [state, setState] = useState<SummaryState>({ status: 'loading' });

  const kpiByKey = Object.fromEntries(loyaltyKpis.map((kpi) => [kpi.key, kpi])) as Record<
    (typeof loyaltyKpis)[number]['key'],
    (typeof loyaltyKpis)[number]
  >;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await getApiClient().listLoyaltyAccounts({ page: 1, limit: 100 });
        if (cancelled) return;

        const accounts = result.data.filter(
          (a): a is AdminLoyaltyAccountListItem => 'userEmail' in a,
        );
        const totalPoints = accounts.reduce((sum, a) => sum + a.pointsBalance, 0);
        const topAccount =
          accounts.length > 0
            ? accounts.reduce((best, a) =>
                a.pointsBalance > best.pointsBalance ? a : best,
              )
            : null;

        setState({
          status: 'ready',
          totalAccounts: result.meta.total,
          totalPoints,
          topAccount,
        });
      } catch (error) {
        if (!cancelled) {
          setState({ status: 'error', message: getDashboardKpiErrorMessage(error) });
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [getDashboardKpiErrorMessage]);

  if (state.status === 'loading') {
    return (
      <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 ${className ?? ''}`}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <Card variant="dashboard" padding="sm" className={className}>
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      </Card>
    );
  }

  const { totalAccounts, totalPoints, topAccount } = state;
  const accountsKpi = kpiByKey.accounts;
  const pointsKpi = kpiByKey.points;
  const topKpi = kpiByKey.topBalance;

  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label={t(accountsKpi.labelKey)}
          subtitle={t(accountsKpi.subtitleKey)}
          status="ready"
          value={formatCount(totalAccounts)}
          icon={accountsKpi.icon}
          iconClassName={accountsKpi.iconClass}
        />
        <StatCard
          label={t(pointsKpi.labelKey)}
          subtitle={t(pointsKpi.subtitleKey)}
          status="ready"
          value={formatPoints(totalPoints)}
          icon={pointsKpi.icon}
          iconClassName={pointsKpi.iconClass}
        />
        {topAccount ? (
          <Card variant="dashboard" padding="sm" className="h-full">
            <p className="text-sm font-medium text-atg-muted">{t(topKpi.labelKey)}</p>
            <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-atg-fg">
              {formatPoints(topAccount.pointsBalance)}
            </p>
            <p className="mt-1 truncate text-xs text-atg-muted">
              {topAccount.userEmail} · {tierLabels[topAccount.tier]}
            </p>
          </Card>
        ) : (
          <StatCard
            label={t(topKpi.labelKey)}
            subtitle={t(topKpi.subtitleKey)}
            status="ready"
            value={tEmpty('dash')}
            icon={topKpi.icon}
            iconClassName={topKpi.iconClass}
          />
        )}
      </div>
    </div>
  );
}
