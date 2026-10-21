'use client';

import { StatCard } from '@africatourismgate/ui';
import type { TreasuryReportSideTotals } from '@africatourismgate/types';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { treasuryKpis, type TreasuryKpiKey } from '../../config/treasury-kpi';
import { getApiClient } from '../../lib/auth/api';
import { useModuleStatCards } from '../../lib/auth/use-module-stat-cards';
import { usePermissions } from '../../lib/auth/use-permissions';
import { formatCount, formatMoney } from '../../lib/format-money';
import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

type KpiCardState = {
  status: 'loading' | 'ready' | 'error';
  displayValue?: string;
  errorMessage?: string;
};

const initialCardState: KpiCardState = { status: 'loading' };

const loadingCards: Record<TreasuryKpiKey, KpiCardState> = {
  entries: { ...initialCardState },
  exits: { ...initialCardState },
  pendingRequests: { ...initialCardState },
  net: { ...initialCardState },
};

function monthDateFrom(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}-01`;
}

function todayDateTo(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function sideDisplayValue(
  side: TreasuryReportSideTotals,
  currency: string | null,
): string {
  if (currency) {
    return formatMoney(side.totalCents, currency);
  }
  if (side.byCurrency?.length === 1) {
    const bucket = side.byCurrency[0]!;
    return formatMoney(bucket.totalCents, bucket.currency);
  }
  return formatCount(side.count);
}

function resolveNetDisplay(
  netCents: number | null,
  currency: string | null,
  entriesByCurrency: TreasuryReportSideTotals['byCurrency'],
  dash: string,
): string {
  if (netCents == null) return dash;
  if (currency) return formatMoney(netCents, currency);
  if (entriesByCurrency?.length === 1) {
    return formatMoney(netCents, entriesByCurrency[0]!.currency);
  }
  return dash;
}

export function TresorerieStatCards({ className }: { className?: string }) {
  const { dashboardKpi: getDashboardKpiErrorMessage } = useAdminErrorMessages();
  const { canLoad, loading: permissionsLoading, shouldRender } =
    useModuleStatCards('treasury.read');
  const { hasPermission } = usePermissions();
  const t = useTranslations('modules.treasury');
  const dash = t('hub.statsDash');
  const [cards, setCards] =
    useState<Record<TreasuryKpiKey, KpiCardState>>(loadingCards);

  useEffect(() => {
    if (permissionsLoading || !canLoad) return;

    let cancelled = false;
    const client = getApiClient();
    const dateFrom = monthDateFrom();
    const dateTo = todayDateTo();
    const canReadReports = hasPermission('treasury.reports.read');

    async function loadAll() {
      setCards(loadingCards);

      const next: Record<TreasuryKpiKey, KpiCardState> = {
        entries: { ...initialCardState },
        exits: { ...initialCardState },
        pendingRequests: { ...initialCardState },
        net: { ...initialCardState },
      };

      const pendingPromise = (async (): Promise<KpiCardState> => {
        try {
          const [submitted, validated] = await Promise.all([
            client.listExpenseRequests({
              page: 1,
              limit: 1,
              status: 'submitted',
            }),
            client.listExpenseRequests({
              page: 1,
              limit: 1,
              status: 'validated',
            }),
          ]);
          return {
            status: 'ready',
            displayValue: formatCount(
              submitted.meta.total + validated.meta.total,
            ),
          };
        } catch (error) {
          return {
            status: 'error',
            errorMessage: getDashboardKpiErrorMessage(error),
          };
        }
      })();

      if (canReadReports) {
        try {
          const summary = await client.getTreasuryReportsSummary({
            dateFrom,
            dateTo,
          });
          next.entries = {
            status: 'ready',
            displayValue: sideDisplayValue(summary.entries, summary.currency),
          };
          next.exits = {
            status: 'ready',
            displayValue: sideDisplayValue(summary.exits, summary.currency),
          };
          next.net = {
            status: 'ready',
            displayValue: resolveNetDisplay(
              summary.netCents,
              summary.currency,
              summary.entries.byCurrency,
              dash,
            ),
          };
        } catch (error) {
          const err = {
            status: 'error' as const,
            errorMessage: getDashboardKpiErrorMessage(error),
          };
          next.entries = err;
          next.exits = err;
          next.net = err;
        }
      } else {
        try {
          const entries = await client.listFundEntries({
            page: 1,
            limit: 1,
            dateFrom,
            dateTo,
            status: 'recorded',
          });
          next.entries = {
            status: 'ready',
            displayValue: formatCount(entries.meta.total),
          };
        } catch (error) {
          next.entries = {
            status: 'error',
            errorMessage: getDashboardKpiErrorMessage(error),
          };
        }

        try {
          const [disbursed, recorded] = await Promise.all([
            client.listFundExits({
              page: 1,
              limit: 1,
              dateFrom,
              dateTo,
              status: 'disbursed',
            }),
            client.listFundExits({
              page: 1,
              limit: 1,
              dateFrom,
              dateTo,
              status: 'recorded',
            }),
          ]);
          next.exits = {
            status: 'ready',
            displayValue: formatCount(
              disbursed.meta.total + recorded.meta.total,
            ),
          };
        } catch (error) {
          next.exits = {
            status: 'error',
            errorMessage: getDashboardKpiErrorMessage(error),
          };
        }

        next.net = { status: 'ready', displayValue: dash };
      }

      next.pendingRequests = await pendingPromise;

      if (!cancelled) setCards(next);
    }

    void loadAll();

    return () => {
      cancelled = true;
    };
  }, [
    canLoad,
    dash,
    getDashboardKpiErrorMessage,
    hasPermission,
    permissionsLoading,
  ]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {treasuryKpis.map((kpi) => {
          const state = cards[kpi.key];
          const href =
            kpi.key === 'net' && !hasPermission('treasury.reports.read')
              ? undefined
              : kpi.href;
          const card = (
            <StatCard
              label={t(kpi.labelKey)}
              subtitle={t(kpi.subtitleKey)}
              status={state.status}
              value={state.displayValue}
              errorMessage={state.errorMessage}
              icon={kpi.icon}
              iconClassName={kpi.iconClass}
            />
          );

          if (href && state.status === 'ready') {
            return (
              <Link
                key={kpi.key}
                href={href}
                className="block rounded-xl transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {card}
              </Link>
            );
          }

          return <div key={kpi.key}>{card}</div>;
        })}
      </div>
    </div>
  );
}
