'use client';

import {
  Button,
  Card,
  DataTable,
  DataTableActions,
  DataTableAdjustButton,
  DataTableBadge,
  DataTablePagination,
  EmptyState,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { AdminLoyaltyAccountListItem, LoyaltyAccount, LoyaltyTier } from '@africatourismgate/types';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { formatPoints, loyaltyTierLabels } from '../../lib/loyalty-tier-utils';
import { getApiClient } from '../../lib/auth/api';
import { getLoyaltyAccountsErrorMessage } from '../../lib/loyalty-accounts-errors';
import { LoyaltySummaryCards } from './loyalty-summary-cards';
import { LoyaltyTierProgress } from './loyalty-tier-progress';
import { LoyaltyTransactionHistoryPanel } from './loyalty-transaction-history-panel';

const PAGE_SIZE = 20;

const tierVariants: Record<LoyaltyTier, 'success' | 'warning' | 'muted' | 'default'> = {
  member: 'muted',
  silver: 'default',
  gold: 'warning',
  platinum: 'success',
};

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

function isAdminListItem(
  account: LoyaltyAccount | AdminLoyaltyAccountListItem,
): account is AdminLoyaltyAccountListItem {
  return 'userEmail' in account;
}

const loyaltyEmptyIcon = (
  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
    />
  </svg>
);

export function LoyaltyAccountsList() {
  const deltaInputId = useId();
  const reasonInputId = useId();

  const [page, setPage] = useState(1);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [historyAccount, setHistoryAccount] = useState<AdminLoyaltyAccountListItem | null>(null);
  const [adjustingAccount, setAdjustingAccount] = useState<AdminLoyaltyAccountListItem | null>(
    null,
  );
  const [adjustDelta, setAdjustDelta] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustError, setAdjustError] = useState<string | null>(null);
  const [acting, setActing] = useState(false);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | {
        status: 'ready';
        accounts: AdminLoyaltyAccountListItem[];
        total: number;
        totalPages: number;
      }
  >({ status: 'loading' });

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listLoyaltyAccounts({
        page,
        limit: PAGE_SIZE,
      });
      const accounts = result.data.filter(isAdminListItem);
      setState({
        status: 'ready',
        accounts,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getLoyaltyAccountsErrorMessage(error) });
    }
  }, [page]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    let cancelled = false;
    void getApiClient()
      .getAuthMe()
      .then((me) => {
        if (!cancelled) {
          setIsSuperAdmin(me.isSuperAdmin);
        }
      })
      .catch(() => {
        if (!cancelled) setIsSuperAdmin(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const submitAdjust = useCallback(async () => {
    if (!adjustingAccount) return;

    const delta = Number.parseInt(adjustDelta, 10);
    if (!Number.isInteger(delta) || delta === 0) {
      setAdjustError('Indiquez une variation entière non nulle (+ ou −).');
      return;
    }

    setAdjustError(null);
    setActing(true);
    try {
      await getApiClient().adjustLoyaltyPoints(adjustingAccount.id, {
        delta,
        reason: adjustReason.trim() || undefined,
      });
      setAdjustingAccount(null);
      setAdjustDelta('');
      setAdjustReason('');
      setHistoryAccount(null);
      await load();
    } catch (error) {
      setAdjustError(getLoyaltyAccountsErrorMessage(error));
    } finally {
      setActing(false);
    }
  }, [adjustDelta, adjustReason, adjustingAccount, load]);

  const columns = useMemo<ColumnDef<AdminLoyaltyAccountListItem, unknown>[]>(
    () => [
      {
        id: 'user',
        header: 'Utilisateur',
        cell: ({ row }) => (
          <div>
            <span className="font-medium text-atg-fg">
              {[row.original.userFirstName, row.original.userLastName]
                .filter(Boolean)
                .join(' ')
                .trim() || '—'}
            </span>
            <p className="text-xs text-atg-muted">{row.original.userEmail}</p>
          </div>
        ),
      },
      {
        accessorKey: 'programCode',
        header: 'Programme',
        cell: ({ row }) => (
          <span className="font-mono text-sm text-atg-fg">{row.original.programCode}</span>
        ),
      },
      {
        id: 'points',
        header: 'Solde & progression',
        meta: { align: 'right' },
        cell: ({ row }) => {
          const account = row.original;
          return (
            <div className="ml-auto max-w-[12rem] space-y-2 text-right">
              <p className="tabular-nums text-lg font-bold text-atg-fg">
                {formatPoints(account.pointsBalance)}
              </p>
              <LoyaltyTierProgress
                pointsBalance={account.pointsBalance}
                tier={account.tier}
                compact
              />
            </div>
          );
        },
      },
      {
        accessorKey: 'tier',
        header: 'Palier',
        meta: { align: 'center' },
        cell: ({ row }) => (
          <DataTableBadge variant={tierVariants[row.original.tier]}>
            {loyaltyTierLabels[row.original.tier]}
          </DataTableBadge>
        ),
      },
      {
        accessorKey: 'lastActivityAt',
        header: 'Dernière activité',
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm tabular-nums text-atg-muted">
            {formatDateTime(row.original.lastActivityAt)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        meta: { align: 'right' },
        cell: ({ row }) => {
          const account = row.original;
          const historyOpen = historyAccount?.id === account.id;
          return (
            <DataTableActions>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="!px-2"
                aria-expanded={historyOpen}
                onClick={() =>
                  setHistoryAccount((prev) => (prev?.id === account.id ? null : account))
                }
              >
                Historique
              </Button>
              {isSuperAdmin ? (
                <DataTableAdjustButton
                  onClick={() => {
                    setAdjustingAccount(account);
                    setAdjustDelta('');
                    setAdjustReason('');
                    setAdjustError(null);
                  }}
                />
              ) : null}
            </DataTableActions>
          );
        },
      },
    ],
    [historyAccount?.id, isSuperAdmin],
  );

  const isLoading = state.status === 'loading';
  const isError = state.status === 'error';
  const accounts = state.status === 'ready' ? state.accounts : [];
  const isEmpty = !isLoading && !isError && accounts.length === 0;

  return (
    <div className="space-y-6">
      <LoyaltySummaryCards />

      {isError ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.message}
        </p>
      ) : null}

      {isEmpty ? (
        <EmptyState
          title="Aucun compte fidélité"
          description="Les comptes OneKey sont créés automatiquement lors des premiers paiements réussis. Ajustements manuels réservés au super administrateur."
          icon={loyaltyEmptyIcon}
        />
      ) : (
        <Card variant="dashboard" padding="none" className="overflow-hidden">
          <DataTable
            columns={columns}
            data={accounts}
            isLoading={isLoading}
            emptyMessage="Aucun compte fidélité pour le moment."
            aria-label="Liste des comptes fidélité"
          />
        </Card>
      )}

      {historyAccount ? (
        <LoyaltyTransactionHistoryPanel
          account={historyAccount}
          onClose={() => setHistoryAccount(null)}
        />
      ) : null}

      {state.status === 'ready' && state.totalPages > 1 ? (
        <DataTablePagination
          page={page}
          pageSize={PAGE_SIZE}
          totalPages={state.totalPages}
          totalItems={state.total}
          itemLabel="comptes"
          onPageChange={setPage}
        />
      ) : null}

      {adjustingAccount ? (
        <Card variant="dashboard" padding="md">
          <h3 className="text-sm font-semibold text-atg-fg">Ajustement manuel des points</h3>
          <p className="mt-1 text-sm text-atg-muted">
            {adjustingAccount.userEmail} · {adjustingAccount.programCode} · solde actuel{' '}
            <span className="font-medium tabular-nums text-atg-fg">
              {formatPoints(adjustingAccount.pointsBalance)}
            </span>
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor={deltaInputId}
                className="mb-1 block text-xs font-medium text-atg-muted"
              >
                Variation (+ ou −)
              </label>
              <input
                id={deltaInputId}
                type="number"
                step={1}
                value={adjustDelta}
                disabled={acting}
                onChange={(e) => setAdjustDelta(e.target.value)}
                placeholder="Ex. 100 ou -50"
                className="w-full rounded-lg border border-atg-border bg-atg-surface px-3 py-2 text-sm tabular-nums text-atg-fg disabled:opacity-60"
              />
            </div>
            <div>
              <label
                htmlFor={reasonInputId}
                className="mb-1 block text-xs font-medium text-atg-muted"
              >
                Motif (optionnel)
              </label>
              <input
                id={reasonInputId}
                type="text"
                value={adjustReason}
                disabled={acting}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="Ex. geste commercial"
                maxLength={500}
                className="w-full rounded-lg border border-atg-border bg-atg-surface px-3 py-2 text-sm text-atg-fg disabled:opacity-60"
              />
            </div>
          </div>
          {adjustError ? (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">
              {adjustError}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              disabled={acting}
              loading={acting}
              loadingText="…"
              onClick={() => void submitAdjust()}
            >
              Appliquer
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={acting}
              onClick={() => {
                setAdjustingAccount(null);
                setAdjustError(null);
              }}
            >
              Annuler
            </Button>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
