'use client';

import {
  Card,
  DataTable,
  DataTableBadge,
  DataTablePagination,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { User, UserAddress } from '@africatourismgate/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getUsersErrorMessage } from '../../lib/users-errors';
import { UserIdFilterBar } from './user-id-filter-bar';
import { UserListCell } from './user-list-cell';

const PAGE_SIZE = 20;

function formatAddress(row: UserAddress): string {
  const parts = [row.line1, row.line2, row.postalCode, row.city, row.region].filter(Boolean);
  return parts.join(', ');
}

export type UserScopedListProps = {
  fixedUserId?: string;
  showUserColumn?: boolean;
};

export function UserAddressesList({
  fixedUserId,
  showUserColumn = true,
}: UserScopedListProps = {}) {
  const [page, setPage] = useState(1);
  const [userIdFilter, setUserIdFilter] = useState(fixedUserId ?? '');
  const [users, setUsers] = useState<User[]>([]);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; rows: UserAddress[]; total: number; totalPages: number }
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
      const result = await getApiClient().listUserAddresses({
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
  }, [page, userIdFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const columns = useMemo<ColumnDef<UserAddress, unknown>[]>(() => {
    const cols: ColumnDef<UserAddress, unknown>[] = [
      {
        id: 'label',
        header: 'Libellé',
        cell: ({ row }) => row.original.label?.trim() || '—',
      },
      {
        id: 'address',
        header: 'Adresse',
        cell: ({ row }) => formatAddress(row.original),
      },
      {
        id: 'country',
        header: 'Pays',
        cell: ({ row }) => row.original.countryCode,
      },
    ];

    if (showUserColumn) {
      cols.push({
        id: 'userId',
        header: 'Utilisateur',
        cell: ({ row }) => (
          <UserListCell userId={row.original.userId} usersById={usersById} />
        ),
      });
    }

    cols.push({
      id: 'default',
      header: 'Par défaut',
      cell: ({ row }) =>
        row.original.isDefault ? (
          <DataTableBadge variant="success">Oui</DataTableBadge>
        ) : (
          <DataTableBadge variant="muted">Non</DataTableBadge>
        ),
    });

    return cols;
  }, [showUserColumn, usersById]);

  const rows = state.status === 'ready' ? state.rows : [];
  const emptyMessage = userIdFilter
    ? 'Aucune adresse pour cet utilisateur.'
    : 'Aucune adresse enregistrée.';

  return (
    <>
      {!fixedUserId ? (
        <UserIdFilterBar onUserIdChange={handleUserIdChange} onUsersLoaded={setUsers} />
      ) : null}

      {state.status === 'error' ? (
        <p role="alert" className="mb-4 text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      ) : null}

      <Card variant="dashboard" padding="none" className="overflow-hidden">
        <DataTable
          columns={columns}
          data={rows}
          getRowId={(row) => row.id}
          isLoading={state.status === 'loading'}
          emptyMessage={emptyMessage}
          aria-label="Liste des adresses utilisateur"
        />
        {state.status === 'ready' && state.totalPages > 0 ? (
          <DataTablePagination
            page={page}
            pageSize={PAGE_SIZE}
            totalPages={state.totalPages}
            totalItems={state.total}
            itemLabel="adresse"
            onPageChange={setPage}
          />
        ) : null}
      </Card>
    </>
  );
}
