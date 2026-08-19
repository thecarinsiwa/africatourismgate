'use client';

import { Drawer } from '@africatourismgate/ui';
import type { AdminLoyaltyAccountListItem } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { useFormatPoints, useLoyaltyTierLabels } from '../../lib/i18n/use-module-labels';
import { LoyaltyTierProgress } from './loyalty-tier-progress';
import { useLoyaltyTransactions } from './use-loyalty-transactions';

type LoyaltyTransactionHistoryPanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: AdminLoyaltyAccountListItem | null;
};

export function LoyaltyTransactionHistoryPanel({
  open,
  onOpenChange,
  account,
}: LoyaltyTransactionHistoryPanelProps) {
  const t = useTranslations('modules.loyalty.history');
  const tColumns = useTranslations('modules.common.columns');
  const tCommon = useTranslations('modules.common');
  const formatPoints = useFormatPoints();
  const tierLabels = useLoyaltyTierLabels();
  const emptyDash = tCommon('empty.dash');

  const { apiAvailable, loading, transactions } = useLoyaltyTransactions(
    account?.id ?? null,
    open,
  );

  const placeholderRows = useMemo(
    () => [
      {
        id: 'placeholder-1',
        date: emptyDash,
        type: t('transactionTypes.paymentCredit'),
        delta: `+${emptyDash}`,
        balance: emptyDash,
      },
      {
        id: 'placeholder-2',
        date: emptyDash,
        type: t('transactionTypes.manualAdjust'),
        delta: `±${emptyDash}`,
        balance: emptyDash,
      },
      {
        id: 'placeholder-3',
        date: emptyDash,
        type: t('transactionTypes.redemption'),
        delta: `−${emptyDash}`,
        balance: emptyDash,
      },
    ],
    [emptyDash, t],
  );

  const tableRows = useMemo(() => {
    if (!apiAvailable) {
      return placeholderRows;
    }

    return transactions.map((row) => ({
      id: row.id,
      date: new Date(row.createdAt).toLocaleString(),
      type: row.type,
      delta:
        row.delta > 0
          ? `+${formatPoints(row.delta)}`
          : row.delta < 0
            ? `−${formatPoints(Math.abs(row.delta))}`
            : formatPoints(0),
      balance: formatPoints(row.balanceAfter),
    }));
  }, [apiAvailable, formatPoints, placeholderRows, transactions]);

  const description = account
    ? [
        [account.userFirstName, account.userLastName].filter(Boolean).join(' ').trim() ||
          account.userEmail,
        account.programCode,
        tierLabels[account.tier],
      ]
        .filter(Boolean)
        .join(' · ')
    : undefined;

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title={t('title')}
      description={description}
      className="max-w-lg"
    >
      {account ? (
        <div className="space-y-4 px-4 py-4">
          <div className="rounded-lg border border-atg-border bg-atg-surface/40 p-4">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-atg-muted">
                  {t('currentBalance')}
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-atg-fg">
                  {formatPoints(account.pointsBalance)}
                </p>
                <p className="text-xs text-atg-muted">{t('pointsUnit')}</p>
              </div>
              <div className="min-w-0 flex-1 sm:max-w-xs">
                <LoyaltyTierProgress
                  pointsBalance={account.pointsBalance}
                  tier={account.tier}
                />
              </div>
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-atg-muted">{tCommon('loading')}</p>
          ) : !apiAvailable ? (
            <p
              role="status"
              className="rounded-lg border border-dashed border-atg-border bg-atg-elevated/50 px-4 py-3 text-sm text-atg-muted"
            >
              {t('apiUnavailable')}
            </p>
          ) : null}

          <div className="overflow-x-auto rounded-lg border border-atg-border">
            <table className="w-full min-w-[420px] text-left text-sm" aria-label={t('tableAria')}>
              <thead className="bg-atg-surface/80 text-xs font-semibold uppercase tracking-wider text-atg-muted">
                <tr>
                  <th className="px-4 py-3" scope="col">
                    {tColumns('date')}
                  </th>
                  <th className="px-4 py-3" scope="col">
                    {tColumns('type')}
                  </th>
                  <th className="px-4 py-3 text-right" scope="col">
                    {t('columns.delta')}
                  </th>
                  <th className="px-4 py-3 text-right" scope="col">
                    {t('columns.balanceAfter')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-atg-border/60">
                {tableRows.map((row) => (
                  <tr key={row.id} className={apiAvailable ? 'text-atg-fg' : 'text-atg-muted'}>
                    <td className="px-4 py-3 tabular-nums">{row.date}</td>
                    <td className="px-4 py-3">{row.type}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium">{row.delta}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{row.balance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </Drawer>
  );
}
