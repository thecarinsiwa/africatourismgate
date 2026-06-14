'use client';

import { Card, Skeleton, StatCard } from '@africatourismgate/ui';
import type { AdminLoyaltyAccountListItem } from '@africatourismgate/types';
import { useEffect, useState } from 'react';
import { getDashboardKpiErrorMessage } from '../../lib/dashboard-api-errors';
import { formatCount } from '../../lib/format-money';
import { getApiClient } from '../../lib/auth/api';
import { formatPoints, loyaltyTierLabels } from '../../lib/loyalty-tier-utils';

const giftIcon = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
    />
  </svg>
);

const pointsIcon = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
    />
  </svg>
);

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
  const [state, setState] = useState<SummaryState>({ status: 'loading' });

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
  }, []);

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

  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Comptes fidélité"
          subtitle="Comptes OneKey actifs"
          status="ready"
          value={formatCount(totalAccounts)}
          icon={giftIcon}
          iconClassName="bg-atg-info-light text-atg-info"
        />
        <StatCard
          label="Points cumulés"
          subtitle="Sur les 100 premiers comptes"
          status="ready"
          value={formatPoints(totalPoints)}
          icon={pointsIcon}
          iconClassName="bg-atg-success-light text-atg-success"
        />
        {topAccount ? (
          <Card variant="dashboard" padding="sm" className="h-full">
            <p className="text-sm font-medium text-atg-muted">Meilleur solde</p>
            <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-atg-fg">
              {formatPoints(topAccount.pointsBalance)}
            </p>
            <p className="mt-1 truncate text-xs text-atg-muted">
              {topAccount.userEmail} · {loyaltyTierLabels[topAccount.tier]}
            </p>
          </Card>
        ) : (
          <StatCard
            label="Meilleur solde"
            subtitle="Aucun compte"
            status="ready"
            value="—"
            icon={pointsIcon}
            iconClassName="bg-atg-warning-light text-atg-warning"
          />
        )}
      </div>
    </div>
  );
}
