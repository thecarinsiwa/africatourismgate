'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  Avatar,
  Button,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTableAdjustButton,
  DataTableBadge,
  DataTablePagination,
  Modal,
  useToast,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { AdminLoyaltyAccountListItem, LoyaltyAccount, LoyaltyTier } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import {
  useFormatDateTime,
  useFormatPoints,
  useLoyaltyTierLabels,
} from '../../lib/i18n/use-module-labels';
import { LoyaltyTierProgress } from './loyalty-tier-progress';
import { LoyaltyTransactionHistoryPanel } from './loyalty-transaction-history-panel';

const PAGE_SIZE = 20;

const tierVariants: Record<LoyaltyTier, 'success' | 'warning' | 'muted' | 'default'> = {
  member: 'muted',
  silver: 'default',
  gold: 'warning',
  platinum: 'success',
};

function isAdminListItem(
  account: LoyaltyAccount | AdminLoyaltyAccountListItem,
): account is AdminLoyaltyAccountListItem {
  return 'userEmail' in account;
}

export function LoyaltyAccountsList() {
  const { loyaltyAccounts: getLoyaltyAccountsErrorMessage } = useAdminErrorMessages();
  const tList = useTranslations('modules.loyalty.list');
  const tAdjust = useTranslations('modules.loyalty.adjust');
  const tLoyaltyToast = useTranslations('modules.loyalty.toast');
  const tColumns = useTranslations('modules.common.columns');
  const tCommon = useTranslations('modules.common');
  const tActions = useTranslations('common.actions');
  const tPagination = useTranslations('modules.common.pagination');
  const tDataTable = useTranslations('modules.common.dataTable');
  const formatPoints = useFormatPoints();
  const formatDateTime = useFormatDateTime('short');
  const tierLabels = useLoyaltyTierLabels();
  const { toast } = useToast();
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
  }, [page, getLoyaltyAccountsErrorMessage]);

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
      setAdjustError(tAdjust('deltaRequired'));
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
      toast({
        variant: 'success',
        message: tLoyaltyToast('adjustedMessage', { email: adjustingAccount.userEmail }),
      });
    } catch (error) {
      const message = getLoyaltyAccountsErrorMessage(error);
      setAdjustError(message);
      toast({
        variant: 'error',
        message,
      });
    } finally {
      setActing(false);
    }
  }, [
    adjustDelta,
    adjustReason,
    adjustingAccount,
    load,
    tAdjust,
    tLoyaltyToast,
    getLoyaltyAccountsErrorMessage,
    toast,
  ]);

  const emptyDash = tCommon('empty.dash');

  const columns = useMemo<ColumnDef<AdminLoyaltyAccountListItem, unknown>[]>(
    () => [
      {
        id: 'user',
        header: tColumns('user'),
        cell: ({ row }) => {
          const account = row.original;
          const fullName = [account.userFirstName, account.userLastName]
            .filter(Boolean)
            .join(' ')
            .trim();
          return (
            <div className="flex min-w-0 items-center gap-3">
              <Avatar
                email={account.userEmail}
                firstName={account.userFirstName}
                lastName={account.userLastName}
                size="sm"
              />
              <div className="min-w-0">
                <span className="block truncate text-sm font-medium text-atg-fg">
                  {fullName || account.userEmail || emptyDash}
                </span>
                {fullName ? (
                  <span className="block truncate text-xs text-atg-muted">
                    {account.userEmail}
                  </span>
                ) : null}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'programCode',
        header: tList('columns.program'),
        meta: { hideOnMobile: true },
        cell: ({ row }) => (
          <DataTableBadge variant="muted">{row.original.programCode}</DataTableBadge>
        ),
      },
      {
        id: 'points',
        header: tList('columns.balanceProgress'),
        cell: ({ row }) => {
          const account = row.original;
          return (
            <div className="min-w-[10rem] max-w-[14rem] space-y-2">
              <p className="tabular-nums text-base font-semibold text-atg-fg">
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
        header: tList('columns.tier'),
        meta: { align: 'center' },
        cell: ({ row }) => (
          <DataTableBadge variant={tierVariants[row.original.tier]}>
            {tierLabels[row.original.tier]}
          </DataTableBadge>
        ),
      },
      {
        accessorKey: 'lastActivityAt',
        header: tList('columns.lastActivity'),
        meta: { hideOnMobile: true },
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm tabular-nums text-atg-muted">
            {formatDateTime(row.original.lastActivityAt)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: tColumns('actions'),
        meta: { align: 'right' },
        cell: ({ row }) => {
          const account = row.original;
          return (
            <DataTableActions className="opacity-90 transition-opacity group-hover:opacity-100">
              <DataTableActionButton
                action="view"
                label={tList('actions.history')}
                aria-expanded={historyAccount?.id === account.id}
                onClick={() =>
                  setHistoryAccount((prev) => (prev?.id === account.id ? null : account))
                }
              />
              {isSuperAdmin ? (
                <DataTableAdjustButton
                  label={tList('actions.adjust')}
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
    [
      emptyDash,
      formatDateTime,
      formatPoints,
      historyAccount?.id,
      isSuperAdmin,
      tierLabels,
      tColumns,
      tList,
    ],
  );

  const accounts = state.status === 'ready' ? state.accounts : [];

  const pagination =
    state.status === 'ready' && state.totalPages > 0 ? (
      <DataTablePagination
        page={page}
        pageSize={PAGE_SIZE}
        totalPages={state.totalPages}
        totalItems={state.total}
        itemLabel={tPagination('loyaltyAccount')}
        onPageChange={setPage}
      />
    ) : null;

  return (
    <div className="space-y-6">
      {state.status === 'error' ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.message}
        </p>
      ) : null}

      <Card variant="dashboard" padding="none" className="overflow-hidden">
        <DataTable
          columns={columns}
          data={accounts}
          getRowId={(row) => row.id}
          isLoading={state.status === 'loading'}
          loadingMessage={tDataTable('loading')}
          emptyMessage={tList('empty.tableMessage')}
          aria-label={tList('ariaLabel')}
        />
        {pagination}
      </Card>

      <LoyaltyTransactionHistoryPanel
        open={historyAccount !== null}
        onOpenChange={(open) => {
          if (!open) setHistoryAccount(null);
        }}
        account={historyAccount}
      />

      <Modal
        open={adjustingAccount !== null}
        onOpenChange={(open) => {
          if (!open && !acting) {
            setAdjustingAccount(null);
            setAdjustError(null);
          }
        }}
        title={tAdjust('title')}
        showClose={!acting}
        closeAriaLabel={tActions('cancel')}
      >
        {adjustingAccount ? (
          <>
            <p className="mb-4 text-sm text-atg-muted">
              {adjustingAccount.userEmail} · {adjustingAccount.programCode} ·{' '}
              {tAdjust('currentBalance')}{' '}
              <span className="font-medium tabular-nums text-atg-fg">
                {formatPoints(adjustingAccount.pointsBalance)}
              </span>
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor={deltaInputId}
                  className="mb-1 block text-xs font-medium text-atg-muted"
                >
                  {tAdjust('fields.delta')}
                </label>
                <input
                  id={deltaInputId}
                  type="number"
                  step={1}
                  value={adjustDelta}
                  disabled={acting}
                  onChange={(e) => setAdjustDelta(e.target.value)}
                  placeholder={tAdjust('deltaPlaceholder')}
                  className="w-full rounded-lg border border-atg-border bg-atg-surface px-3 py-2 text-sm tabular-nums text-atg-fg disabled:opacity-60"
                />
              </div>
              <div>
                <label
                  htmlFor={reasonInputId}
                  className="mb-1 block text-xs font-medium text-atg-muted"
                >
                  {tAdjust('fields.reason')}
                </label>
                <input
                  id={reasonInputId}
                  type="text"
                  value={adjustReason}
                  disabled={acting}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder={tAdjust('reasonPlaceholder')}
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
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                disabled={acting}
                onClick={() => {
                  setAdjustingAccount(null);
                  setAdjustError(null);
                }}
              >
                {tActions('cancel')}
              </Button>
              <Button
                type="button"
                disabled={acting}
                loading={acting}
                loadingText="…"
                onClick={() => void submitAdjust()}
              >
                {tAdjust('apply')}
              </Button>
            </div>
          </>
        ) : null}
      </Modal>
    </div>
  );
}
