'use client';

import type { LoyaltyAccount, LoyaltyTier } from '@africatourismgate/types';
import { Spinner } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { getAccountApiClient } from '../../lib/api/account';

function tierLabel(
  tier: LoyaltyTier,
  labels: Record<LoyaltyTier, string>,
): string {
  return labels[tier];
}

export function AccountLoyaltyPanel() {
  const t = useTranslations('account');
  const [accounts, setAccounts] = useState<LoyaltyAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tierLabels: Record<LoyaltyTier, string> = {
    member: t('loyalty.tierMember'),
    silver: t('loyalty.tierSilver'),
    gold: t('loyalty.tierGold'),
    platinum: t('loyalty.tierPlatinum'),
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const client = await getAccountApiClient();
      const result = await client.listLoyaltyAccounts({ limit: 20 });
      setAccounts(result.data);
    } catch {
      setError(t('loyalty.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="md" variant="primary" label={t('loading')} showLabel />
      </div>
    );
  }

  if (error) {
    return (
      <p role="alert" className="text-sm text-red-600 dark:text-red-400">
        {error}
      </p>
    );
  }

  const primary =
    accounts.find((a) => a.programCode === 'ONEKEY') ?? accounts[0] ?? null;

  if (!primary) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-atg-muted">{t('loyalty.empty')}</p>
        <p className="text-sm text-atg-muted">{t('loyalty.earnHint')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-6 dark:border-primary/30 dark:from-primary/10">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">
          {t('loyalty.programLabel')} · {primary.programCode}
        </p>
        <p
          data-testid="loyalty-points-balance"
          className="mt-2 text-4xl font-bold tabular-nums text-atg-fg"
        >
          {primary.pointsBalance.toLocaleString()}
        </p>
        <p className="mt-1 text-sm text-atg-muted">
          {t('loyalty.pointsLabel')}
        </p>
        <span className="mt-4 inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary dark:bg-primary/20">
          {tierLabel(primary.tier, tierLabels)}
        </span>
      </div>

      <p className="text-sm text-atg-muted">{t('loyalty.earnHint')}</p>

      {accounts.length > 1 ? (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-atg-fg">
            {t('loyalty.allPrograms')}
          </h3>
          <ul className="divide-y divide-atg-border rounded-lg border border-atg-border dark:divide-atg-border dark:border-atg-border">
            {accounts.map((account) => (
              <li
                key={account.id}
                className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
              >
                <span className="font-medium text-atg-fg">
                  {account.programCode}
                </span>
                <span className="text-atg-muted">
                  {account.pointsBalance.toLocaleString()} {t('loyalty.pointsShort')}
                </span>
                <span className="text-atg-muted">
                  {tierLabel(account.tier, tierLabels)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
