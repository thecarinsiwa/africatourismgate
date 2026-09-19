'use client';

import type { PublicPaymentBankAccount } from '@africatourismgate/types';

export type BankTransferAccountsLabels = {
  title: string;
  empty: string;
  holder: string;
  accountNumber: string;
  swift: string;
  currency: string;
  referenceHint: string;
};

type Props = {
  accounts: PublicPaymentBankAccount[];
  labels: BankTransferAccountsLabels;
  bookingRef?: string | null;
  loading?: boolean;
};

export function BankTransferAccountsPanel({
  accounts,
  labels,
  bookingRef,
  loading = false,
}: Props) {
  if (loading) {
    return (
      <div className="rounded-lg border border-atg-border p-4 text-sm text-atg-muted dark:border-atg-border">
        …
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-atg-border bg-atg-surface p-4 dark:border-atg-border dark:bg-white/5">
      <p className="text-sm font-semibold text-atg-fg">{labels.title}</p>
      {bookingRef ? (
        <p className="text-xs text-atg-muted">
          {labels.referenceHint.replace('{ref}', bookingRef.slice(0, 8))}
        </p>
      ) : null}
      {accounts.length === 0 ? (
        <p className="text-sm text-amber-700 dark:text-amber-300">{labels.empty}</p>
      ) : (
        <ul className="space-y-3">
          {accounts.map((account) => (
            <li
              key={account.id}
              className="rounded-lg border border-atg-border/80 px-3 py-2 text-sm text-atg-fg dark:border-atg-border"
            >
              <p className="font-medium">{account.bankName}</p>
              <p className="mt-1 text-atg-muted">
                {labels.holder}: {account.accountName}
              </p>
              <p className="font-mono text-xs">
                {labels.accountNumber}: {account.accountNumber}
              </p>
              {account.swiftBic ? (
                <p className="text-xs text-atg-muted">
                  {labels.swift}: {account.swiftBic}
                </p>
              ) : null}
              <p className="text-xs text-atg-muted">
                {labels.currency}: {account.currency}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
