'use client';

import {
  Button,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTableBadge,
  DataTablePagination,
  Skeleton,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { User, UserSession } from '@africatourismgate/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getUsersErrorMessage } from '../../lib/users-errors';
import type { UserScopedListProps } from './user-addresses-list';
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

type UserSessionsListProps = UserScopedListProps & {
  layout?: 'table' | 'cards';
};

function SessionCard({
  session,
  usersById,
  showUser,
  revoking,
  onRevoke,
}: {
  session: UserSession;
  usersById: Map<string, User>;
  showUser: boolean;
  revoking: boolean;
  onRevoke: (session: UserSession) => void;
}) {
  const expired = isSessionExpired(session.expiresAt);

  return (
    <Card variant="dashboard" padding="md" className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {showUser ? (
            <UserListCell userId={session.userId} usersById={usersById} />
          ) : (
            <p className="text-sm font-medium text-atg-fg">Session</p>
          )}
        </div>
        <DataTableBadge variant={expired ? 'muted' : 'success'}>
          {expired ? 'Expirée' : 'Active'}
        </DataTableBadge>
      </div>
      <dl className="grid gap-2 text-sm">
        <div className="flex justify-between gap-2">
          <dt className="text-atg-muted">Créée le</dt>
          <dd className="text-right font-medium text-atg-fg">
            {formatDateTime(session.createdAt)}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-atg-muted">Expire le</dt>
          <dd className="text-right text-atg-fg">{formatDateTime(session.expiresAt)}</dd>
        </div>
      </dl>
      {!expired ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full !text-red-600 dark:!text-red-400"
          onClick={() => onRevoke(session)}
          disabled={revoking}
          loading={revoking}
        >
          Révoquer
        </Button>
      ) : null}
    </Card>
  );
}

export function UserSessionsList({
  fixedUserId,
  showUserColumn = true,
  layout = 'cards',
}: UserSessionsListProps = {}) {
  const [page, setPage] = useState(1);
  const [userIdFilter, setUserIdFilter] = useState(fixedUserId ?? '');
  const [users, setUsers] = useState<User[]>([]);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; rows: UserSession[]; total: number; totalPages: number }
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
      if (!window.confirm("Révoquer cette session ? L'utilisateur devra se reconnecter.")) {
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

  const columns = useMemo<ColumnDef<UserSession, unknown>[]>(() => {
    const cols: ColumnDef<UserSession, unknown>[] = [];

    if (showUserColumn) {
      cols.push({
        id: 'user',
        header: 'Utilisateur',
        cell: ({ row }) => (
          <UserListCell userId={row.original.userId} usersById={usersById} />
        ),
      });
    }

    cols.push(
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
          <DataTableActions>
            <DataTableActionButton
              action="revoke"
              onClick={() => void handleRevoke(row.original)}
              disabled={revokingId === row.original.id}
              loading={revokingId === row.original.id}
            />
          </DataTableActions>
        ),
      },
    );

    return cols;
  }, [handleRevoke, revokingId, showUserColumn, usersById]);

  const rows = state.status === 'ready' ? state.rows : [];
  const emptyMessage = userIdFilter
    ? 'Aucune session active pour cet utilisateur.'
    : 'Aucune session active.';

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

      {layout === 'cards' ? (
        <div className="space-y-4">
          {state.status === 'loading' ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-xl" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <Card variant="dashboard" padding="lg">
              <p className="text-sm text-atg-muted">{emptyMessage}</p>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rows.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  usersById={usersById}
                  showUser={showUserColumn}
                  revoking={revokingId === session.id}
                  onRevoke={(s) => void handleRevoke(s)}
                />
              ))}
            </div>
          )}
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
        </div>
      ) : (
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
      )}
    </>
  );
}
