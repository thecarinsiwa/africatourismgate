'use client';

import { StatCard } from '@africatourismgate/ui';
import type { OrganizationBankAccount } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { bankAccountsKpis, type BankAccountsKpiKey } from '../../config/bank-accounts-kpi';
import { formatCount } from '../../lib/format-money';

type BankAccountsStatCardsProps = {
  accounts: OrganizationBankAccount[];
  loading: boolean;
  error?: string | null;
  className?: string;
};

type KpiCardState = {
  status: 'loading' | 'ready' | 'error';
  displayValue?: string;
  errorMessage?: string;
};

function computeStats(accounts: OrganizationBankAccount[]): Record<BankAccountsKpiKey, string> {
  const defaultCount = accounts.filter((account) => account.isDefault).length;
  const banks = new Set(accounts.map((account) => account.bankName.trim()).filter(Boolean));
  const currencies = new Set(accounts.map((account) => account.currency.trim()).filter(Boolean));

  return {
    total: formatCount(accounts.length),
    default: formatCount(defaultCount),
    banks: formatCount(banks.size),
    currencies: formatCount(currencies.size),
  };
}

export function BankAccountsStatCards({
  accounts,
  loading,
  error = null,
  className,
}: BankAccountsStatCardsProps) {
  const t = useTranslations('modules.settings.bankAccounts');

  const stats = useMemo(() => computeStats(accounts), [accounts]);

  const cards = useMemo<Record<BankAccountsKpiKey, KpiCardState>>(() => {
    if (loading) {
      return {
        total: { status: 'loading' },
        default: { status: 'loading' },
        banks: { status: 'loading' },
        currencies: { status: 'loading' },
      };
    }

    if (error) {
      return {
        total: { status: 'error', errorMessage: error },
        default: { status: 'error', errorMessage: error },
        banks: { status: 'error', errorMessage: error },
        currencies: { status: 'error', errorMessage: error },
      };
    }

    return {
      total: { status: 'ready', displayValue: stats.total },
      default: { status: 'ready', displayValue: stats.default },
      banks: { status: 'ready', displayValue: stats.banks },
      currencies: { status: 'ready', displayValue: stats.currencies },
    };
  }, [error, loading, stats]);

  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {bankAccountsKpis.map((kpi) => {
          const state = cards[kpi.key];
          return (
            <StatCard
              key={kpi.key}
              label={t(kpi.labelKey)}
              subtitle={t(kpi.subtitleKey)}
              status={state.status}
              value={state.displayValue}
              errorMessage={state.errorMessage}
              icon={kpi.icon}
              iconClassName={kpi.iconClass}
            />
          );
        })}
      </div>
    </div>
  );
}
