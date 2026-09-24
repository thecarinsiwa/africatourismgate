'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  Card,
  DataTable,
  DataTableBadge,
  DataTablePagination,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { User, UserPaymentMethod } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { UserIdFilterBar } from './user-id-filter-bar';
import { UserListCell } from './user-list-cell';
import type { UserScopedListProps } from './user-addresses-list';

const PAGE_SIZE = 20;

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

export function UserPaymentMethodsList({
  fixedUserId,
  showUserColumn = true,
}: UserScopedListProps = {}) {
  const { users: getUsersErrorMessage } = useAdminErrorMessages();
  const tPaymentMethods = useTranslations('modules.users.paymentMethods');
  const tColumns = useTranslations('modules.common.columns');
  const tBoolean = useTranslations('modules.common.boolean');
  const tEmpty = useTranslations('modules.common.empty');
  const tPagination = useTranslations('modules.common.pagination');
  const tDataTable = useTranslations('modules.common.dataTable');
  const [page, setPage] = useState(1);
  const [userIdFilter, setUserIdFilter] = useState(fixedUserId ?? '');
  const [users, setUsers] = useState<User[]>([]);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | {
        status: 'ready';
        rows: UserPaymentMethod[];
        total: number;
        totalPages: number;
      }
  >({ status: 'loading' });

  const usersById = useMemo(() => new Map(users.map((user) => [user.id, user])), [users]);

  useEffect(() => {
    if (fixedUserId) {
      setUserIdFilter(fixedUserId);
    }
  }, [fixedUserId]);

  const handleUserIdChange = useCallback(
    (userId: string) => {
      if (fixedUserId) return;
      setUserIdFilter(userId);
      setPage(1);
    },
    [fixedUserId],
  );

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listUserPaymentMethods({
        page,
        limit: PAGE_SIZE,
        userId: userIdFilter || undefined,
      });
      setState({
        status: 'ready',
        rows: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getUsersErrorMessage(error) });
    }
  }, [page, userIdFilter, getUsersErrorMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  const columns = useMemo<ColumnDef<UserPaymentMethod, unknown>[]>(() => {
    const cols: ColumnDef<UserPaymentMethod, unknown>[] = [
      {
        id: 'type',
        header: tColumns('type'),
        meta: { cellClassName: 'min-w-0' },
        cell: ({ row }) => (
          <div className="min-w-0">
            <span className="block truncate font-medium text-atg-fg">{row.original.type}</span>
            <p className="truncate text-xs text-atg-muted sm:hidden">
              {row.original.provider?.trim() || tEmpty('dash')}
              {row.original.lastFour
                ? ` · ${tPaymentMethods('lastFourMasked', { lastFour: row.original.lastFour })}`
                : ''}
            </p>
          </div>
        ),
      },
      {
        id: 'provider',
        header: tColumns('paymentProvider'),
        meta: { hideOnMobile: true },
        cell: ({ row }) => row.original.provider?.trim() || tEmpty('dash'),
      },
      {
        id: 'lastFour',
        header: tColumns('end'),
        meta: { hideOnMobile: true },
        cell: ({ row }) =>
          row.original.lastFour
            ? tPaymentMethods('lastFourMasked', { lastFour: row.original.lastFour })
            : tEmpty('dash'),
      },
    ];

    if (showUserColumn) {
      cols.push({
        id: 'userId',
        header: tColumns('user'),
        meta: { hideOnMobile: true },
        cell: ({ row }) => (
          <UserListCell userId={row.original.userId} usersById={usersById} />
        ),
      });
    }

    cols.push(
      {
        id: 'createdAt',
        header: tColumns('addedAt'),
        meta: { hideOnMobile: true },
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-atg-muted">
            {formatDateTime(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: 'default',
        header: tColumns('default'),
        meta: { hideOnMobile: true },
        cell: ({ row }) =>
          row.original.isDefault ? (
            <DataTableBadge variant="success">{tBoolean('yes')}</DataTableBadge>
          ) : (
            <DataTableBadge variant="muted">{tBoolean('no')}</DataTableBadge>
          ),
      },
    );

    return cols;
  }, [showUserColumn, tBoolean, tColumns, tEmpty, tPaymentMethods, usersById]);

  const rows = state.status === 'ready' ? state.rows : [];
  const emptyMessage = userIdFilter
    ? tPaymentMethods('emptyFiltered')
    : tPaymentMethods('emptyDefault');

  return (
    <div className="min-w-0 space-y-4 overflow-x-hidden">
      {!fixedUserId ? (
        <UserIdFilterBar onUserIdChange={handleUserIdChange} onUsersLoaded={setUsers} />
      ) : null}

      {state.status === 'error' ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      ) : null}

      <Card variant="dashboard" padding="none" className="min-w-0 overflow-hidden">
        <DataTable
          columns={columns}
          data={rows}
          getRowId={(row) => row.id}
          isLoading={state.status === 'loading'}
          loadingMessage={tDataTable('loading')}
          emptyMessage={emptyMessage}
          expandRowLabel={tDataTable('expandRow')}
          collapseRowLabel={tDataTable('collapseRow')}
          expandRowAriaLabel={tDataTable('expandRowAria')}
          aria-label={tPaymentMethods('ariaLabel')}
          className="min-w-0"
        />
        {state.status === 'ready' && state.totalPages > 0 ? (
          <DataTablePagination
            page={page}
            pageSize={PAGE_SIZE}
            totalPages={state.totalPages}
            totalItems={state.total}
            itemLabel={tPagination('paymentMethod')}
            onPageChange={setPage}
          />
        ) : null}
      </Card>
    </div>
  );
}
