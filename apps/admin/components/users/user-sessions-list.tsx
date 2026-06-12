'use client';

import {
  Button,
  Card,
  DataTable,
  DataTableBadge,
  DataTablePagination,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { User, UserSession } from '@africatourismgate/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getUsersErrorMessage } from '../../lib/users-errors';
import { UserIdFilterBar } from './user-id-filter-bar';
import { UserListCell } from './user-list-cell';

const PAGE_SIZE = 20;

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'medium',
    });
  } catch {
    return iso;
  }
}

function isSessionExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() <= Date.now();
}

export function UserSessionsList() {
  const [page, setPage] = useState(1);
  const [userIdFilter, setUserIdFilter] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; rows: UserSession[]; total: number; totalPages: number }
  >({ status: 'loading' });

  const usersById = useMemo(() => new Map(users.map((user) => [user.id, user])), [users]);

  const handleUserIdChange = useCallback((userId: string) => {
    setUserIdFilter(userId);
    setPage(1);
  }, []);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listUserSessions({
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

  const handleRevoke = useCallback(
    async (row: UserSession) => {
      if (!window.confirm('Révoquer cette session ? L’utilisateur devra se reconnecter.')) {
        return;
      }
      setRevokingId(row.id);
      try {
        await getApiClient().revokeUserSession(row.id);
        await load();
      } catch (error) {
        window.alert(getUsersErrorMessage(error));
      } finally {
        setRevokingId(null);
      }
    },
    [load],
  );

  const columns = useMemo<ColumnDef<UserSession, unknown>[]>(
    () => [
      {
        id: 'user',
        header: 'Utilisateur',
        cell: ({ row }) => (
          <UserListCell userId={row.original.userId} usersById={usersById} />
        ),
      },
      {
        id: 'createdAt',
        header: 'Créée le',
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm">
            {formatDateTime(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: 'expiresAt',
        header: 'Expire le',
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-atg-muted">
            {formatDateTime(row.original.expiresAt)}
          </span>
        ),
      },
      {
        id: 'status',
        header: 'Statut',
        meta: { align: 'center' },
        cell: ({ row }) =>
          isSessionExpired(row.original.expiresAt) ? (
            <DataTableBadge variant="muted">Expirée</DataTableBadge>
          ) : (
            <DataTableBadge variant="success">Active</DataTableBadge>
          ),
      },
      {
        id: 'actions',
        header: 'Actions',
        meta: { align: 'right' },
        cell: ({ row }) => (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => void handleRevoke(row.original)}
            disabled={revokingId === row.original.id}
            loading={revokingId === row.original.id}
            className="!text-red-600"
          >
            Révoquer
          </Button>
        ),
      },
    ],
    [handleRevoke, revokingId, usersById],
  );

  const rows = state.status === 'ready' ? state.rows : [];
  const emptyMessage = userIdFilter
    ? 'Aucune session active pour cet utilisateur.'
    : 'Aucune session active.';

  return (
    <>
      <UserIdFilterBar onUserIdChange={handleUserIdChange} onUsersLoaded={setUsers} />

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
          aria-label="Liste des sessions utilisateur"
        />
        {state.status === 'ready' && state.totalPages > 0 ? (
          <DataTablePagination
            page={page}
            pageSize={PAGE_SIZE}
            totalPages={state.totalPages}
            totalItems={state.total}
            itemLabel="session"
            onPageChange={setPage}
          />
        ) : null}
      </Card>
    </>
  );
}
