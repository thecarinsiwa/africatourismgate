'use client';

import { Button, Card } from '@africatourismgate/ui';
import type { AdminLoyaltyAccountListItem } from '@africatourismgate/types';
import { formatPoints, loyaltyTierLabels } from '../../lib/loyalty-tier-utils';
import { LoyaltyTierProgress } from './loyalty-tier-progress';

type LoyaltyTransactionHistoryPanelProps = {
  account: AdminLoyaltyAccountListItem;
  onClose: () => void;
};

const placeholderRows = [
  {
    id: 'placeholder-1',
    date: '—',
    type: 'Crédit paiement',
    delta: '+—',
    balance: '—',
  },
  {
    id: 'placeholder-2',
    date: '—',
    type: 'Ajustement manuel',
    delta: '±—',
    balance: '—',
  },
];

export function LoyaltyTransactionHistoryPanel({
  account,
  onClose,
}: LoyaltyTransactionHistoryPanelProps) {
  const fullName = [account.userFirstName, account.userLastName].filter(Boolean).join(' ').trim();

  return (
    <Card variant="dashboard" padding="md" className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-atg-fg">Historique des transactions</h3>
          <p className="mt-1 text-sm text-atg-muted">
            {fullName || account.userEmail} · {account.programCode} ·{' '}
            {loyaltyTierLabels[account.tier]}
          </p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          Fermer
        </Button>
      </div>

      <div className="rounded-lg border border-atg-border bg-atg-surface/40 p-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-atg-muted">Solde actuel</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-atg-fg">
              {formatPoints(account.pointsBalance)}
            </p>
            <p className="text-xs text-atg-muted">points</p>
          </div>
          <div className="min-w-[12rem] flex-1 sm:max-w-xs">
            <LoyaltyTierProgress pointsBalance={account.pointsBalance} tier={account.tier} />
          </div>
        </div>
      </div>

      <p className="rounded-lg border border-dashed border-atg-border bg-atg-elevated/50 px-4 py-3 text-sm text-atg-muted">
        L&apos;API d&apos;historique des transactions n&apos;est pas encore disponible. La structure
        ci-dessous anticipe le futur journal des mouvements de points.
      </p>

      <div className="overflow-x-auto rounded-lg border border-atg-border">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="bg-atg-surface/80 text-xs font-semibold uppercase tracking-wider text-atg-muted">
            <tr>
              <th className="px-4 py-3" scope="col">
                Date
              </th>
              <th className="px-4 py-3" scope="col">
                Type
              </th>
              <th className="px-4 py-3 text-right" scope="col">
                Variation
              </th>
              <th className="px-4 py-3 text-right" scope="col">
                Solde après
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-atg-border/60">
            {placeholderRows.map((row) => (
              <tr key={row.id} className="text-atg-muted">
                <td className="px-4 py-3 tabular-nums">{row.date}</td>
                <td className="px-4 py-3">{row.type}</td>
                <td className="px-4 py-3 text-right tabular-nums font-medium">{row.delta}</td>
                <td className="px-4 py-3 text-right tabular-nums">{row.balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
